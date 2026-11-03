import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { addMonths } from '@/lib/date';
import { computeEligibility, computeLoan, Eligibility, requiresMemberVote } from '@/lib/loan';
import { CONTRIBUTIONS, LOANS, MEMBERS, SETTINGS } from './mock';
import { Contribution, GroupSettings, Loan, LoanVote, Member } from './types';

/**
 * In-memory data store for the prototype. Everything screens need to read or
 * mutate lives here behind a small, Supabase-shaped API. When we wire the real
 * backend, this provider becomes a thin layer over Supabase + React Query and
 * the screens stay unchanged.
 */

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export interface ApplyLoanInput {
  borrowerId: string;
  principal: number;
  reason: string;
  trusteeId: string;
}

export interface AddContributionInput {
  memberId: string;
  period: string;
  submittedAmount: number;
  receiptUri: string | null;
  note?: string;
}

export interface AddMemberInput {
  fullName: string;
  email: string;
  phone: string;
}

const AVATAR_COLORS = ['#7C3AED', '#C026D3', '#A78BFA', '#9333EA', '#5B21B6', '#6366F1', '#D946EF'];

interface DataContextValue {
  settings: GroupSettings;
  members: Member[];
  contributions: Contribution[];
  loans: Loan[];

  // ---- selectors ----
  memberById: (id: string) => Member | undefined;
  memberSavings: (memberId: string) => number;
  totalFund: () => number;
  outstandingPrincipal: () => number;
  availableCash: () => number;
  memberPercent: (memberId: string) => number;
  eligibilityFor: (memberId: string) => Eligibility;
  contributionsFor: (memberId: string) => Contribution[];
  pendingContributions: () => Contribution[];
  loansByBorrower: (memberId: string) => Loan[];
  loansAwaitingVote: (memberId: string) => Loan[];
  loansForReview: () => Loan[];
  loanById: (id: string) => Loan | undefined;
  voterCountFor: (loan: Loan) => number;

  // ---- actions ----
  addMember: (input: AddMemberInput) => Member;
  addContribution: (input: AddContributionInput) => void;
  verifyContribution: (id: string, approvedAmount: number, verifierId: string) => void;
  rejectContribution: (id: string, reason: string, verifierId: string) => void;
  applyLoan: (input: ApplyLoanInput) => Loan;
  setLoanTerms: (loanId: string, interestRate: number, termMonths: number, adminId: string) => void;
  castVote: (loanId: string, memberId: string, vote: 'approve' | 'reject') => void;
  disburseLoan: (loanId: string, adminId: string) => void;
  rejectLoan: (loanId: string, adminId: string) => void;
  recordRepayment: (loanId: string, amount: number) => void;
  updateSettings: (patch: Partial<GroupSettings>) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GroupSettings>(SETTINGS);
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [contributions, setContributions] = useState<Contribution[]>(CONTRIBUTIONS);
  const [loans, setLoans] = useState<Loan[]>(LOANS);

  const memberById = useCallback((id: string) => members.find((m) => m.id === id), [members]);

  const memberSavings = useCallback(
    (memberId: string) =>
      contributions
        .filter((c) => c.memberId === memberId && c.status === 'approved')
        .reduce((sum, c) => sum + (c.approvedAmount ?? 0), 0),
    [contributions],
  );

  const totalFund = useCallback(
    () =>
      contributions
        .filter((c) => c.status === 'approved')
        .reduce((sum, c) => sum + (c.approvedAmount ?? 0), 0),
    [contributions],
  );

  const outstandingPrincipal = useCallback(
    () =>
      loans
        .filter((l) => l.status === 'active' || l.status === 'approved')
        .reduce((sum, l) => sum + Math.max(0, l.principal - l.amountRepaid), 0),
    [loans],
  );

  const availableCash = useCallback(
    () => totalFund() - outstandingPrincipal(),
    [totalFund, outstandingPrincipal],
  );

  const memberPercent = useCallback(
    (memberId: string) => {
      const fund = totalFund();
      return fund > 0 ? memberSavings(memberId) / fund : 0;
    },
    [totalFund, memberSavings],
  );

  const eligibilityFor = useCallback(
    (memberId: string) =>
      computeEligibility({
        memberSavings: memberSavings(memberId),
        totalFund: totalFund(),
        availableCash: availableCash(),
        multiplier: settings.loanMultiplier,
        reserveRatio: settings.reserveRatio,
      }),
    [memberSavings, totalFund, availableCash, settings],
  );

  const contributionsFor = useCallback(
    (memberId: string) =>
      contributions
        .filter((c) => c.memberId === memberId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [contributions],
  );

  const pendingContributions = useCallback(
    () =>
      contributions
        .filter((c) => c.status === 'pending')
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [contributions],
  );

  const loansByBorrower = useCallback(
    (memberId: string) =>
      loans
        .filter((l) => l.borrowerId === memberId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [loans],
  );

  const voterCountFor = useCallback(
    (loan: Loan) => members.filter((m) => m.id !== loan.borrowerId).length,
    [members],
  );

  const loansAwaitingVote = useCallback(
    (memberId: string) =>
      loans.filter(
        (l) =>
          l.status === 'pending_members' &&
          l.borrowerId !== memberId &&
          !l.votes.some((v) => v.memberId === memberId),
      ),
    [loans],
  );

  const loansForReview = useCallback(
    () =>
      loans
        .filter((l) => l.status === 'pending_terms' || l.status === 'pending_members' || l.status === 'approved')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [loans],
  );

  const loanById = useCallback((id: string) => loans.find((l) => l.id === id), [loans]);

  // ---------------- actions ----------------

  const addMember = useCallback(
    (input: AddMemberInput) => {
      const member: Member = {
        id: uid('m'),
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        role: 'member',
        avatarColor: AVATAR_COLORS[members.length % AVATAR_COLORS.length],
        joinedAt: nowIso(),
      };
      setMembers((prev) => [...prev, member]);
      return member;
    },
    [members.length],
  );

  const addContribution = useCallback((input: AddContributionInput) => {
    setContributions((prev) => [
      {
        id: uid('c'),
        memberId: input.memberId,
        period: input.period,
        submittedAmount: input.submittedAmount,
        approvedAmount: null,
        status: 'pending',
        receiptUri: input.receiptUri,
        note: input.note,
        createdAt: nowIso(),
      },
      ...prev,
    ]);
  }, []);

  const verifyContribution = useCallback(
    (id: string, approvedAmount: number, verifierId: string) => {
      setContributions((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: 'approved',
                approvedAmount,
                verifiedBy: verifierId,
                verifiedAt: nowIso(),
                rejectionReason: null,
              }
            : c,
        ),
      );
    },
    [],
  );

  const rejectContribution = useCallback((id: string, reason: string, verifierId: string) => {
    setContributions((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: 'rejected', approvedAmount: null, verifiedBy: verifierId, verifiedAt: nowIso(), rejectionReason: reason }
          : c,
      ),
    );
  }, []);

  const applyLoan = useCallback(
    (input: ApplyLoanInput) => {
      const needsVote = requiresMemberVote(input.principal, memberSavings(input.borrowerId));
      const loan: Loan = {
        id: uid('l'),
        borrowerId: input.borrowerId,
        principal: input.principal,
        reason: input.reason,
        trusteeId: input.trusteeId,
        interestRate: null,
        termMonths: null,
        status: 'pending_terms',
        requiresMemberVote: needsVote,
        votes: [],
        createdAt: nowIso(),
        amountRepaid: 0,
      };
      setLoans((prev) => [loan, ...prev]);
      return loan;
    },
    [memberSavings],
  );

  const setLoanTerms = useCallback(
    (loanId: string, interestRate: number, termMonths: number, adminId: string) => {
      setLoans((prev) =>
        prev.map((l) => {
          if (l.id !== loanId) return l;
          const needsVote = requiresMemberVote(l.principal, memberSavings(l.borrowerId));
          return {
            ...l,
            interestRate,
            termMonths,
            requiresMemberVote: needsVote,
            // Small loans the admin can authorise alone go straight to approved.
            status: needsVote ? 'pending_members' : 'approved',
            approvedBy: needsVote ? null : adminId,
            decidedAt: needsVote ? null : nowIso(),
          };
        }),
      );
    },
    [memberSavings],
  );

  const castVote = useCallback(
    (loanId: string, memberId: string, vote: 'approve' | 'reject') => {
      setLoans((prev) =>
        prev.map((l) => {
          if (l.id !== loanId || l.status !== 'pending_members') return l;
          const votes: LoanVote[] = [
            ...l.votes.filter((v) => v.memberId !== memberId),
            { memberId, vote, createdAt: nowIso() },
          ];
          const voters = members.filter((m) => m.id !== l.borrowerId).length;
          const approvals = votes.filter((v) => v.vote === 'approve').length;
          const anyReject = votes.some((v) => v.vote === 'reject');
          let status = l.status;
          let decidedAt = l.decidedAt;
          if (anyReject) {
            status = 'rejected';
            decidedAt = nowIso();
          } else if (approvals >= voters) {
            status = 'approved';
            decidedAt = nowIso();
          }
          return { ...l, votes, status, decidedAt };
        }),
      );
    },
    [members],
  );

  const disburseLoan = useCallback((loanId: string, adminId: string) => {
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== loanId || l.status !== 'approved') return l;
        const disbursedAt = nowIso();
        return {
          ...l,
          status: 'active',
          approvedBy: l.approvedBy ?? adminId,
          disbursedAt,
          dueDate: l.termMonths ? addMonths(disbursedAt, l.termMonths) : null,
        };
      }),
    );
  }, []);

  const rejectLoan = useCallback((loanId: string, adminId: string) => {
    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId ? { ...l, status: 'rejected', approvedBy: adminId, decidedAt: nowIso() } : l,
      ),
    );
  }, []);

  const recordRepayment = useCallback((loanId: string, amount: number) => {
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== loanId) return l;
        const amountRepaid = l.amountRepaid + amount;
        const total =
          l.interestRate != null && l.termMonths != null
            ? computeLoan(l.principal, l.interestRate, l.termMonths).totalRepayable
            : l.principal;
        return {
          ...l,
          amountRepaid,
          status: amountRepaid >= total - 1 ? 'repaid' : l.status,
        };
      }),
    );
  }, []);

  const updateSettings = useCallback((patch: Partial<GroupSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      settings,
      members,
      contributions,
      loans,
      memberById,
      memberSavings,
      totalFund,
      outstandingPrincipal,
      availableCash,
      memberPercent,
      eligibilityFor,
      contributionsFor,
      pendingContributions,
      loansByBorrower,
      loansAwaitingVote,
      loansForReview,
      loanById,
      voterCountFor,
      addMember,
      addContribution,
      verifyContribution,
      rejectContribution,
      applyLoan,
      setLoanTerms,
      castVote,
      disburseLoan,
      rejectLoan,
      recordRepayment,
      updateSettings,
    }),
    [
      settings, members, contributions, loans, memberById, memberSavings, totalFund,
      outstandingPrincipal, availableCash, memberPercent, eligibilityFor, contributionsFor,
      pendingContributions, loansByBorrower, loansAwaitingVote, loansForReview, loanById,
      voterCountFor, addMember, addContribution, verifyContribution, rejectContribution, applyLoan,
      setLoanTerms, castVote, disburseLoan, rejectLoan, recordRepayment, updateSettings,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
