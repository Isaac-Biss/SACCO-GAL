# Family SACCO 💜

A savings-and-loans app for a family investment group (SACCO), built as **one
codebase for Android, iOS and web** with Expo + React Native. Members contribute
monthly, see everyone's share of the fund, and apply for loans the group approves
together.

> **Status:** working prototype. Every screen runs on realistic in-memory data so
> you can click through the whole experience today. A Supabase backend
> (auth, database, receipt storage) is scaffolded and ready to wire in — see
> [Going live with Supabase](#going-live-with-supabase).

---

## What it does

### For every member
- **Dashboard** — your total savings, your **percentage share of the fund**, your
  rank, and a live donut chart showing *everyone's* share.
- **Contributions** — record a monthly deposit, pick the month, and upload a
  **screenshot / photo of the receipt**. It stays *pending* until an admin verifies it.
- **Group** — the whole membership ranked by contribution, each with their %.
- **Loans** — apply for a loan, approve other members' loans, track repayments.

### Loan rules (the heart of the system)
- **Eligibility is the smaller of two caps:**
  1. **1.5× your own savings** (configurable multiplier), and
  2. a **reserve limit** so the fund always keeps **≥ 50%** of its value after the loan.
- **Approval path depends on size:**
  - Loan **≤ your savings** → the **admin can authorise it alone**.
  - Loan **> your savings** → **every member must approve** before money is released.
- **Interest & term** are set by the admin per loan; the app **auto-computes the
  compound (monthly) interest**, total repayable, monthly instalment and a full
  repayment schedule.
- **Transparency** — the reason, principal and total repayable appear on every
  member's dashboard so they can vote.
- **Trustee** — each application names a trustee who reminds the borrower and is
  liable if they default.

### For the admin
- **Verify deposits** — view the receipt, then **approve the amount as-is or edit
  it** to match what actually hit the account (or reject with a reason).
- **Manage loans** — set interest + term, authorise small loans, send big ones to a
  member vote, release approved money, and record repayments.
- **Group settings** — group name, loan multiplier, reserve ratio, default interest.

---

## Try it

```bash
npm install
npm run web      # open in the browser
npm run ios      # iOS simulator (Mac)
npm run android  # Android emulator
# or: npx expo start  and scan the QR code with Expo Go on your phone
```

**Prototype sign-in:** use `isaacssozi98@gmail.com` (admin) or
`grace.nakato@example.com` (member). Any password works. On the **Profile** tab
there's a *“view as another member”* switcher so you can experience admin
verification and member loan-voting without juggling accounts.

---

## Tech stack

| Layer     | Choice |
|-----------|--------|
| App       | Expo (SDK 58) · React Native · TypeScript · Expo Router (file-based) |
| UI        | Custom purple/white design system (no heavy UI library) |
| Charts    | `react-native-svg` donut |
| Data (now)| In-memory store in `src/data/store.tsx` (mock seed data) |
| Data (next)| Supabase — Postgres + Auth + Storage (scaffolded) |
| State     | React Context + TanStack Query (installed) |

### Project structure
```
src/
  app/                 # screens (Expo Router)
    (auth)/            # sign-in / sign-up
    (app)/             # authenticated tabs
      dashboard.tsx
      contributions/   # list + add deposit
      loans/           # list + apply + detail/voting
      members.tsx
      profile.tsx
      admin/           # verify deposits · manage loans · settings
  components/          # BrandMark, cards, charts, PageHeader
    ui/                # design-system primitives (Button, Card, Input…)
  constants/theme.ts   # purple/white design tokens
  data/                # types, mock seed, store (the swap point)
  auth/                # AuthContext
  lib/                 # money, dates, loan maths, status maps, supabase client
supabase/schema.sql    # database + RLS + storage, ready to run
```

The **loan maths** (compound interest, repayment schedule, the two eligibility
caps) live in [`src/lib/loan.ts`](src/lib/loan.ts) and are pure functions, so they're
easy to read and test independently of the UI.

---

## Going live with Supabase

The app is built so the backend is a drop-in swap — screens never talk to data
directly, only through `useData()` in [`src/data/store.tsx`](src/data/store.tsx).

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql). It creates
   the tables, row-level-security policies, the `receipts` storage bucket, and a
   trigger that makes a `profiles` row on sign-up.
3. `cp .env.example .env` and fill in your project URL + anon key.
4. Make yourself admin once you've signed up:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```
5. Replace the mock reads/writes in `DataProvider` with calls to the client in
   [`src/lib/supabase.ts`](src/lib/supabase.ts) — the method names already match the
   table shapes.

Secrets live in `.env` (git-ignored). Only `EXPO_PUBLIC_`-prefixed keys reach the app.

---

## Roadmap
- [ ] Wire Supabase (auth, queries, receipt uploads to storage)
- [ ] Push notifications for pending votes, verifications and repayment reminders
- [ ] Repayment receipt uploads + automatic default flagging
- [ ] Statements / export (PDF) per member and for the group
- [ ] Multi-currency and configurable contribution cycles
