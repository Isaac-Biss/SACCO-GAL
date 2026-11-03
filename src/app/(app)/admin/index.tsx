import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { LoanCard } from '@/components/LoanCard';
import { PageHeader } from '@/components/PageHeader';
import { Card, EmptyState, Screen, Text } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useData } from '@/data/store';
import { Loan } from '@/data/types';

export default function AdminLoans() {
  const router = useRouter();
  const d = useData();

  const open = (loan: Loan) => router.push({ pathname: '/(app)/loans/[id]', params: { id: loan.id } });
  const card = (loan: Loan) => (
    <LoanCard
      key={loan.id}
      loan={loan}
      borrower={d.memberById(loan.borrowerId)}
      voterCount={d.voterCountFor(loan)}
      onPress={() => open(loan)}
    />
  );

  const needsAction = d.loans.filter((l) => l.status === 'pending_terms' || l.status === 'approved');
  const voting = d.loans.filter((l) => l.status === 'pending_members');
  const settled = d.loans.filter((l) => ['active', 'repaid', 'rejected', 'defaulted'].includes(l.status));

  return (
    <Screen>
      <PageHeader title="Manage loans" subtitle="ADMIN" back />

      {needsAction.length > 0 ? (
        <View style={styles.section}>
          <Card flat style={styles.actionHint}>
            <Text variant="small" color="textSecondary">
              These need you to set interest &amp; term, or release approved money.
            </Text>
          </Card>
          <Text variant="label" color="textSecondary" style={styles.label}>
            NEEDS YOUR ACTION
          </Text>
          {needsAction.map(card)}
        </View>
      ) : null}

      {voting.length > 0 ? (
        <View style={styles.section}>
          <Text variant="label" color="textSecondary" style={styles.label}>
            OUT FOR MEMBER VOTE
          </Text>
          {voting.map(card)}
        </View>
      ) : null}

      {settled.length > 0 ? (
        <View style={styles.section}>
          <Text variant="label" color="textSecondary" style={styles.label}>
            ACTIVE &amp; PAST
          </Text>
          {settled.map(card)}
        </View>
      ) : null}

      {d.loans.length === 0 ? (
        <EmptyState icon="cash-outline" title="No loans" message="Loan applications from members will show up here for review." />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: theme.spacing.lg },
  label: { marginBottom: theme.spacing.sm },
  actionHint: { marginBottom: theme.spacing.md, backgroundColor: theme.colors.warningBg, borderColor: theme.colors.warningBg },
});
