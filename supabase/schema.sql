-- ============================================================================
--  Family SACCO — Supabase schema
--  Run this in the Supabase SQL editor (or `supabase db push`) on a new project.
--  It mirrors the TypeScript types in src/data/types.ts.
-- ============================================================================

-- ---------- Enums ------------------------------------------------------------
create type member_role           as enum ('member', 'admin');
create type contribution_status   as enum ('pending', 'approved', 'rejected');
create type loan_status           as enum (
  'pending_terms', 'pending_members', 'approved', 'active', 'rejected', 'repaid', 'defaulted'
);
create type vote_choice           as enum ('approve', 'reject');

-- ---------- Profiles ---------------------------------------------------------
-- One row per auth user. Everyone in the group can see everyone (transparency),
-- which is what powers the per-member contribution percentages.
create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text not null,
  email        text not null,
  phone        text,
  role         member_role not null default 'member',
  avatar_color text not null default '#7C3AED',
  joined_at    timestamptz not null default now()
);

-- ---------- Group settings (single row) -------------------------------------
create table group_settings (
  id                    int primary key default 1 check (id = 1),
  group_name            text not null default 'Family SACCO',
  loan_multiplier       numeric not null default 1.5,   -- personal cap = multiplier x savings
  reserve_ratio         numeric not null default 0.5,   -- fund keeps >= this fraction after a loan
  default_interest_rate numeric not null default 0.05   -- monthly, decimal
);
insert into group_settings (id) values (1) on conflict do nothing;

-- ---------- Contributions ----------------------------------------------------
create table contributions (
  id               uuid primary key default gen_random_uuid(),
  member_id        uuid not null references profiles (id) on delete cascade,
  period           text not null,                       -- 'YYYY-MM'
  submitted_amount numeric not null check (submitted_amount >= 0),
  approved_amount  numeric check (approved_amount >= 0),
  status           contribution_status not null default 'pending',
  receipt_path     text,                                -- path in the 'receipts' storage bucket
  note             text,
  rejection_reason text,
  verified_by      uuid references profiles (id),
  verified_at      timestamptz,
  created_at       timestamptz not null default now()
);
create index on contributions (member_id);
create index on contributions (status);

-- ---------- Loans ------------------------------------------------------------
create table loans (
  id                   uuid primary key default gen_random_uuid(),
  borrower_id          uuid not null references profiles (id) on delete cascade,
  principal            numeric not null check (principal > 0),
  reason               text not null,
  trustee_id           uuid not null references profiles (id),
  interest_rate        numeric,                          -- monthly decimal, set by admin
  term_months          int,                              -- set by admin
  status               loan_status not null default 'pending_terms',
  requires_member_vote boolean not null default false,
  amount_repaid        numeric not null default 0,
  approved_by          uuid references profiles (id),
  decided_at           timestamptz,
  disbursed_at         timestamptz,
  due_date             timestamptz,
  created_at           timestamptz not null default now()
);
create index on loans (borrower_id);
create index on loans (status);

-- ---------- Loan votes -------------------------------------------------------
create table loan_votes (
  id         uuid primary key default gen_random_uuid(),
  loan_id    uuid not null references loans (id) on delete cascade,
  member_id  uuid not null references profiles (id) on delete cascade,
  vote       vote_choice not null,
  created_at timestamptz not null default now(),
  unique (loan_id, member_id)
);

-- ---------- Loan repayments --------------------------------------------------
create table loan_repayments (
  id           uuid primary key default gen_random_uuid(),
  loan_id      uuid not null references loans (id) on delete cascade,
  amount       numeric not null check (amount > 0),
  receipt_path text,
  recorded_by  uuid references profiles (id),
  created_at   timestamptz not null default now()
);

-- ============================================================================
--  Helpers
-- ============================================================================

-- Is the current user an admin? SECURITY DEFINER avoids RLS recursion on profiles.
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Create a profile row automatically when a user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
--  Row Level Security
-- ============================================================================
alter table profiles        enable row level security;
alter table group_settings  enable row level security;
alter table contributions   enable row level security;
alter table loans           enable row level security;
alter table loan_votes      enable row level security;
alter table loan_repayments enable row level security;

-- Profiles: everyone sees everyone; you edit yourself; admins edit anyone.
create policy "profiles readable by members"   on profiles for select to authenticated using (true);
create policy "update own profile"             on profiles for update to authenticated using (id = auth.uid());
create policy "admins update any profile"      on profiles for update to authenticated using (is_admin());

-- Group settings: readable by all, editable by admins.
create policy "settings readable"              on group_settings for select to authenticated using (true);
create policy "admins edit settings"           on group_settings for update to authenticated using (is_admin());

-- Contributions: readable by all; you create your own pending deposits; admins verify.
create policy "contributions readable"         on contributions for select to authenticated using (true);
create policy "members add own contribution"   on contributions for insert to authenticated
  with check (member_id = auth.uid() and status = 'pending');
create policy "admins verify contributions"    on contributions for update to authenticated using (is_admin());

-- Loans: readable by all; you apply for your own; admins manage.
create policy "loans readable"                 on loans for select to authenticated using (true);
create policy "members apply own loan"         on loans for insert to authenticated
  with check (borrower_id = auth.uid() and status = 'pending_terms');
create policy "admins manage loans"            on loans for update to authenticated using (is_admin());

-- Votes: readable by all; you cast your own vote and may not vote on your own loan.
create policy "votes readable"                 on loan_votes for select to authenticated using (true);
create policy "members cast own vote"          on loan_votes for insert to authenticated
  with check (
    member_id = auth.uid()
    and not exists (select 1 from loans l where l.id = loan_id and l.borrower_id = auth.uid())
  );

-- Repayments: readable by all; borrower or admin records them.
create policy "repayments readable"            on loan_repayments for select to authenticated using (true);
create policy "borrower or admin records repayment" on loan_repayments for insert to authenticated
  with check (
    is_admin()
    or exists (select 1 from loans l where l.id = loan_id and l.borrower_id = auth.uid())
  );

-- ============================================================================
--  Storage: receipts bucket (deposit + repayment proof images)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy "members upload receipts" on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts');
create policy "members read receipts"   on storage.objects for select to authenticated
  using (bucket_id = 'receipts');

-- ============================================================================
--  After the first person signs up, make them the admin:
--    update profiles set role = 'admin' where email = 'you@example.com';
-- ============================================================================
