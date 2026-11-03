/**
 * Loan maths for the SACCO.
 *
 *  - Interest compounds monthly at a rate the admin sets per loan.
 *  - Total repayable  A = P · (1 + r)^n   (P principal, r monthly rate, n months)
 *  - The compounded total is then split into n equal monthly instalments.
 *
 * Eligibility has TWO independent ceilings; the real limit is the smaller:
 *   1. Personal cap  = multiplier × member's own savings      (default 1.5×)
 *   2. Reserve cap   = cash that can leave while the whole fund
 *                      still keeps `reserveRatio` of its value in reserve.
 */

export interface RepaymentRow {
  month: number;        // 1..n
  openingBalance: number;
  interest: number;     // interest accrued this month
  payment: number;      // instalment paid this month
  closingBalance: number;
}

export interface LoanComputation {
  principal: number;
  monthlyRate: number;      // e.g. 0.05 for 5%/month
  termMonths: number;
  totalRepayable: number;   // principal + interest
  totalInterest: number;
  monthlyPayment: number;   // equal instalment
  schedule: RepaymentRow[];
}

/** Compute the full repayment picture for a loan. */
export function computeLoan(
  principal: number,
  monthlyRate: number,
  termMonths: number,
): LoanComputation {
  const p = Math.max(0, principal);
  const r = Math.max(0, monthlyRate);
  const n = Math.max(1, Math.round(termMonths));

  const totalRepayable = p * Math.pow(1 + r, n);
  const totalInterest = totalRepayable - p;
  const monthlyPayment = totalRepayable / n;

  // Build an informational amortisation-style schedule. Interest is shown as the
  // share of total interest surfacing each month; balance walks down to zero.
  const schedule: RepaymentRow[] = [];
  let balance = totalRepayable;
  const interestPerMonth = totalInterest / n;
  for (let month = 1; month <= n; month++) {
    const opening = balance;
    const payment = Math.min(monthlyPayment, opening);
    balance = Math.max(0, opening - payment);
    schedule.push({
      month,
      openingBalance: opening,
      interest: interestPerMonth,
      payment,
      closingBalance: balance,
    });
  }

  return { principal: p, monthlyRate: r, termMonths: n, totalRepayable, totalInterest, monthlyPayment, schedule };
}

export interface EligibilityInput {
  memberSavings: number;    // this member's approved contributions
  totalFund: number;        // all members' approved contributions
  availableCash: number;    // totalFund minus money already lent out & outstanding
  multiplier: number;       // personal cap multiplier (1.5)
  reserveRatio: number;     // fraction the fund must retain (0.5)
}

export interface Eligibility {
  personalCap: number;      // multiplier × savings
  reserveCap: number;       // most that can leave keeping reserve intact
  maxLoan: number;          // min(personalCap, reserveCap), never below 0
  binding: 'personal' | 'reserve' | 'none';
}

/** Work out how much this member may borrow right now. */
export function computeEligibility(input: EligibilityInput): Eligibility {
  const personalCap = Math.max(0, input.multiplier * input.memberSavings);
  const reserveCap = Math.max(0, input.availableCash - input.reserveRatio * input.totalFund);
  const maxLoan = Math.max(0, Math.min(personalCap, reserveCap));

  let binding: Eligibility['binding'] = 'none';
  if (maxLoan <= 0) binding = reserveCap <= personalCap ? 'reserve' : 'personal';
  else binding = personalCap <= reserveCap ? 'personal' : 'reserve';

  return { personalCap, reserveCap, maxLoan, binding };
}

/**
 * A loan needs a full member vote when the requested principal exceeds the
 * borrower's own savings. At or below their savings, the admin can authorise
 * it alone.
 */
export function requiresMemberVote(principal: number, memberSavings: number): boolean {
  return principal > memberSavings;
}
