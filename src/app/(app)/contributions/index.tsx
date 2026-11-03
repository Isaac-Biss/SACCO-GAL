import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ContributionCard } from '@/components/ContributionCard';
import { PageHeader } from '@/components/PageHeader';
import { Button, Card, EmptyState, Screen, SegmentedControl, Text } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';
import { useData } from '@/data/store';
import { ContributionStatus } from '@/data/types';
import { formatMoney } from '@/lib/money';

type Filter = 'all' | 'approved' | 'pending';

export default function ContributionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const d = useData();
  const [filter, setFilter] = useState<Filter>('all');
  if (!user) return null;

  const all = d.contributionsFor(user.id);
  const savings = d.memberSavings(user.id);
  const pendingTotal = all
    .filter((c) => c.status === 'pending')
    .reduce((s, c) => s + c.submittedAmount, 0);

  const shown = all.filter((c) => {
    if (filter === 'all') return true;
    return c.status === (filter as ContributionStatus);
  });

  return (
    <Screen
      footer={
        <Button
          title="Add contribution"
          icon="add-circle-outline"
          onPress={() => router.push('/(app)/contributions/new')}
        />
      }>
      <PageHeader title="My savings" subtitle="CONTRIBUTIONS" />

      <Card style={styles.summary}>
        <View style={styles.summaryRow}>
          <View>
            <Text variant="label" color="textSecondary">
              TOTAL SAVED
            </Text>
            <Text variant="h1" color="primary">
              {formatMoney(savings)}
            </Text>
          </View>
          {pendingTotal > 0 ? (
            <View style={styles.alignEnd}>
              <Text variant="label" color="textSecondary">
                PENDING
              </Text>
              <Text variant="h3" color="warning">
                {formatMoney(pendingTotal)}
              </Text>
            </View>
          ) : null}
        </View>
      </Card>

      <View style={styles.segment}>
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          segments={[
            { value: 'all', label: 'All' },
            { value: 'approved', label: 'Approved' },
            { value: 'pending', label: 'Pending' },
          ]}
        />
      </View>

      {shown.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          title="No contributions yet"
          message="Tap “Add contribution” to record your first monthly deposit and upload the receipt."
        />
      ) : (
        shown.map((c) => <ContributionCard key={c.id} contribution={c} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { marginBottom: theme.spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
  segment: { marginBottom: theme.spacing.lg },
});
