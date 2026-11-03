/** Domain types for the Family SACCO. Mirrors the eventual Supabase schema. */

export type Role = 'member' | 'admin';

export interface Member {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  avatarColor: string;
  joinedAt: string; // ISO
}

export type ContributionStatus = 'pending' | 'approved' | 'rejected';

export interface Contribution {
  id: string;
  memberId: string;
  period: string; // "YYYY-MM"
  submittedAmount: number;
  approvedAmount: number | null; // set when approved (may differ from submitted)
  status: ContributionStatus;
  receiptUri: string | null;
  note?: string;
  createdAt: string;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
}

export type LoanStatus =
  | 'pending_terms' // applied; admin must set interest + term
  | 'pending_members' // terms set, large loan awaiting member vote
  | 'approved' // approved but not yet disbursed
  | 'active' // disbursed, being repaid
  | 'rejected'
  | 'repaid'
  | 'defaulted';

export interface LoanVote {
  memberId: string;
  vote: 'approve' | 'reject';
  createdAt: string;
}

export interface Loan {
  id: string;
  borrowerId: string;
  principal: number;
  reason: string;
  trusteeId: string;
  interestRate: number | null; // monthly, decimal (0.05 = 5%/mo); set by admin
  termMonths: number | null; // set by admin
  status: LoanStatus;
  requiresMemberVote: boolean;
  votes: LoanVote[];
  createdAt: string;
  decidedAt?: string | null;
  approvedBy?: string | null;
  disbursedAt?: string | null;
  dueDate?: string | null;
  amountRepaid: number;
}

export interface GroupSettings {
  groupName: string;
  loanMultiplier: number; // personal cap = multiplier × savings (1.5)
  reserveRatio: number; // fund must retain this fraction (0.5)
  defaultInterestRate: number; // prefilled for admin, monthly decimal
}
