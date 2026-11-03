import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Avatar, Badge, Card, ProgressBar, Text } from '@/components/ui';
import { theme } from '@/constants/theme';
import { Loan, Member } from '@/data/types';
import { computeLoan } from '@/lib/loan';
import { formatMoney, formatMoneyCompact, formatPercent } from '@/lib/money';
import { LOAN_STATUS } from '@/lib/status';

interface LoanCardProps {
  loan: Loan;
  borrower?: Member;
  /** Shows "You" instead of the borrower name. */
  isMine?: boolean;
  /** Approvals needed for the vote line. */
  voterCount?: number;
  onPress?: () => void;
}

export function LoanCard({ loan, borrower, isMine, voterCount, onPress }: LoanCardProps) {
  const status = LOAN_STATUS[loan.status];
  const hasTerms = loan.interestRate != null && loan.termMonths != null;
  const calc = hasTerms ? computeLoan(loan.principal, loan.interestRate!, loan.termMonths!) : null;

  let secondary: string;
  if (loan.status === 'pending_terms') {
    secondary = 'Waiting for the admin to set interest & term';
  } else if (loan.status === 'pending_members') {
    const approvals = loan.votes.filter((v) => v.vote === 'approve').length;
    secondary = `${approvals}/${voterCount ?? '?'} members approved`;
  } else if (calc) {
    secondary = `Repays ${formatMoneyCompact(calc.totalRepayable)} · ${formatMoney(calc.monthlyPayment)}/mo`;
  } else {
    secondary = '';
  }

  const progress = calc && calc.totalRepayable > 0 ? loan.amountRepaid / calc.totalRepayable : 0;
  const showProgress = loan.status === 'active' || loan.status === 'repaid';

  return (
    <Card compact onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Avatar name={borrower?.fullName ?? '?'} color={borrower?.avatarColor} size={44} />
        <View style={styles.flex}>
          <View style={styles.topRow}>
            <Text variant="bodyStrong" numberOfLines={1}>
              {isMine ? 'You' : borrower?.fullName ?? 'Member'}
            </Text>
            <Badge label={status.label} tone={status.tone} icon={status.icon} />
          </View>
          <Text variant="h3" style={styles.amount}>
            {formatMoney(loan.principal)}
          </Text>
          <Text variant="small" color="textSecondary" numberOfLines={1}>
            {secondary}
          </Text>
        </View>
        {onPress ? <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} /> : null}
      </View>

      {showProgress && calc ? (
        <View style={styles.progressWrap}>
          <ProgressBar value={progress} />
          <Text variant="tiny" color="textMuted" style={styles.progressText}>
            {formatPercent(progress, 0)} repaid
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  flex: { flex: 1, gap: 2 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  amount: { marginTop: 2 },
  progressWrap: { marginTop: theme.spacing.md, gap: 4 },
  progressText: { textAlign: 'right' },
});
