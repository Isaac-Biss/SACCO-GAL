import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { LoanCard } from '@/components/LoanCard';
import { PageHeader } from '@/components/PageHeader';
import { Button, Card, EmptyState, Screen, Text } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';
import { useData } from '@/data/store';
import { Loan } from '@/data/types';

export default function LoansScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const d = useData();
  if (!user) return null;

  const openDetail = (loan: Loan) =>
    router.push({ pathname: '/(app)/loans/[id]', params: { id: loan.id } });

  const toVote = d.loansAwaitingVote(user.id);
  const mine = d.loansByBorrower(user.id);
  const others = d.loans
    .filter((l) => l.borrowerId !== user.id && !toVote.some((v) => v.id === l.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const renderCard = (loan: Loan) => (
    <LoanCard
      key={loan.id}
      loan={loan}
      borrower={d.memberById(loan.borrowerId)}
      isMine={loan.borrowerId === user.id}
      voterCount={d.voterCountFor(loan)}
      onPress={() => openDetail(loan)}
    />
  );

  const empty = toVote.length === 0 && mine.length === 0 && others.length === 0;

  return (
    <Screen
      footer={
        <Button title="Apply for a loan" icon="cash-outline" onPress={() => router.push('/(app)/loans/apply')} />
      }>
      <PageHeader title="Loans" subtitle="BORROW & APPROVE" />

      {empty ? (
        <EmptyState
          icon="cash-outline"
          title="No loans yet"
          message="When a member applies for a loan, it appears here for the group to review and approve."
        />
      ) : null}

      {toVote.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="label" color="textSecondary">
              NEEDS YOUR VOTE
            </Text>
            <View style={styles.badge}>
              <Text variant="tiny" color="textOnPrimary">
                {toVote.length}
              </Text>
            </View>
          </View>
          <Card flat style={styles.voteHint}>
            <Text variant="small" color="textSecondary">
              These loans exceed the borrower’s own savings, so every member must approve before the
              money is released.
            </Text>
          </Card>
          {toVote.map(renderCard)}
        </View>
      ) : null}

      {mine.length > 0 ? (
        <View style={styles.section}>
          <Text variant="label" color="textSecondary" style={styles.sectionLabel}>
            YOUR LOANS
          </Text>
          {mine.map(renderCard)}
        </View>
      ) : null}

      {others.length > 0 ? (
        <View style={styles.section}>
          <Text variant="label" color="textSecondary" style={styles.sectionLabel}>
            GROUP LOANS
          </Text>
          {others.map(renderCard)}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: theme.spacing.lg },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: theme.spacing.sm },
  sectionLabel: { marginBottom: theme.spacing.sm },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteHint: { marginBottom: theme.spacing.md, backgroundColor: theme.colors.infoBg, borderColor: theme.colors.infoBg },
});
