import { palette } from '@/constants/theme';
import { Contribution, GroupSettings, Loan, Member } from './types';

/**
 * Seed data for the prototype. Shapes match the Supabase schema, so swapping
 * the in-memory store for real queries later is a drop-in change.
 *
 * "Today" in the seed world is early November 2026.
 */

export const SETTINGS: GroupSettings = {
  groupName: 'Ssozi Family SACCO',
  loanMultiplier: 1.5,
  reserveRatio: 0.5,
  defaultInterestRate: 0.05,
};

export const MEMBERS: Member[] = [
  { id: 'm1', fullName: 'Isaac Ssozi', email: 'isaacssozi98@gmail.com', phone: '+256 772 000001', role: 'admin', avatarColor: palette.purple600, joinedAt: '2026-07-01T09:00:00Z' },
  { id: 'm2', fullName: 'Grace Nakato', email: 'grace.nakato@example.com', phone: '+256 772 000002', role: 'member', avatarColor: '#C026D3', joinedAt: '2026-07-02T09:00:00Z' },
  { id: 'm3', fullName: 'Daniel Okello', email: 'daniel.okello@example.com', phone: '+256 772 000003', role: 'member', avatarColor: palette.purple400, joinedAt: '2026-07-03T09:00:00Z' },
  { id: 'm4', fullName: 'Sarah Auma', email: 'sarah.auma@example.com', phone: '+256 772 000004', role: 'member', avatarColor: '#9333EA', joinedAt: '2026-07-05T09:00:00Z' },
  { id: 'm5', fullName: 'Peter Mukasa', email: 'peter.mukasa@example.com', phone: '+256 772 000005', role: 'member', avatarColor: palette.purple800, joinedAt: '2026-07-10T09:00:00Z' },
  { id: 'm6', fullName: 'Esther Nambi', email: 'esther.nambi@example.com', phone: '+256 772 000006', role: 'member', avatarColor: '#6366F1', joinedAt: '2026-08-01T09:00:00Z' },
];

const receipt = (seed: string) => `https://picsum.photos/seed/${seed}/600/800`;

/** Approved monthly contributions, built so each member has a tidy savings total. */
function approved(
  id: string,
  memberId: string,
  period: string,
  amount: number,
): Contribution {
  return {
    id,
    memberId,
    period,
    submittedAmount: amount,
    approvedAmount: amount,
    status: 'approved',
    receiptUri: receipt(id),
    createdAt: `${period}-12T10:00:00Z`,
    verifiedBy: 'm1',
    verifiedAt: `${period}-13T08:00:00Z`,
  };
}

function pending(
  id: string,
  memberId: string,
  period: string,
  amount: number,
  note?: string,
): Contribution {
  return {
    id,
    memberId,
    period,
    submittedAmount: amount,
    approvedAmount: null,
    status: 'pending',
    receiptUri: receipt(id),
    note,
    createdAt: `${period}-02T18:30:00Z`,
  };
}

export const CONTRIBUTIONS: Contribution[] = [
  // Isaac — 2,000,000 saved
  approved('c-m1-08', 'm1', '2026-08', 700_000),
  approved('c-m1-09', 'm1', '2026-09', 700_000),
  approved('c-m1-10', 'm1', '2026-10', 600_000),
  // Grace — 1,500,000 saved
  approved('c-m2-08', 'm2', '2026-08', 500_000),
  approved('c-m2-09', 'm2', '2026-09', 500_000),
  approved('c-m2-10', 'm2', '2026-10', 500_000),
  // Daniel — 1,000,000 saved
  approved('c-m3-08', 'm3', '2026-08', 400_000),
  approved('c-m3-09', 'm3', '2026-09', 300_000),
  approved('c-m3-10', 'm3', '2026-10', 300_000),
  // Sarah — 800,000 saved
  approved('c-m4-08', 'm4', '2026-08', 300_000),
  approved('c-m4-09', 'm4', '2026-09', 300_000),
  approved('c-m4-10', 'm4', '2026-10', 200_000),
  // Peter — 600,000 saved
  approved('c-m5-08', 'm5', '2026-08', 200_000),
  approved('c-m5-09', 'm5', '2026-09', 200_000),
  approved('c-m5-10', 'm5', '2026-10', 200_000),
  // Esther — 400,000 saved
  approved('c-m6-08', 'm6', '2026-08', 150_000),
  approved('c-m6-09', 'm6', '2026-09', 150_000),
  approved('c-m6-10', 'm6', '2026-10', 100_000),

  // November deposits awaiting the admin's verification
  pending('c-m2-11', 'm2', '2026-11', 500_000, 'Sent via mobile money, see receipt.'),
  pending('c-m5-11', 'm5', '2026-11', 250_000, 'Bank transfer this morning.'),
  pending('c-m6-11', 'm6', '2026-11', 100_000),
];

export const LOANS: Loan[] = [
  // Small loan already running (<= Daniel's savings, admin authorised alone)
  {
    id: 'l1',
    borrowerId: 'm3',
    principal: 800_000,
    reason: 'School fees for the new term.',
    trusteeId: 'm1',
    interestRate: 0.04,
    termMonths: 4,
    status: 'active',
    requiresMemberVote: false,
    votes: [],
    createdAt: '2026-10-05T11:00:00Z',
    decidedAt: '2026-10-06T09:00:00Z',
    approvedBy: 'm1',
    disbursedAt: '2026-10-06T12:00:00Z',
    dueDate: '2027-02-06T12:00:00Z',
    amountRepaid: 234_000,
  },
  // Large loan (> Grace's savings) out for a full member vote right now
  {
    id: 'l2',
    borrowerId: 'm2',
    principal: 2_000_000,
    reason: 'Expanding my produce stall at the market before the festive season.',
    trusteeId: 'm4',
    interestRate: 0.05,
    termMonths: 6,
    status: 'pending_members',
    requiresMemberVote: true,
    votes: [
      { memberId: 'm1', vote: 'approve', createdAt: '2026-11-01T10:00:00Z' },
      { memberId: 'm3', vote: 'approve', createdAt: '2026-11-01T14:00:00Z' },
      { memberId: 'm4', vote: 'approve', createdAt: '2026-11-02T08:00:00Z' },
    ],
    createdAt: '2026-10-31T16:00:00Z',
    amountRepaid: 0,
  },
  // Fresh application — admin still needs to set interest + term
  {
    id: 'l3',
    borrowerId: 'm5',
    principal: 300_000,
    reason: 'Emergency medical bill.',
    trusteeId: 'm3',
    interestRate: null,
    termMonths: null,
    status: 'pending_terms',
    requiresMemberVote: false,
    votes: [],
    createdAt: '2026-11-02T20:00:00Z',
    amountRepaid: 0,
  },
];
