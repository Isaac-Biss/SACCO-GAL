import { StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/PageHeader';
import { Avatar, Badge, Card, ProgressBar, Screen, Text } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';
import { useData } from '@/data/store';
import { formatMoney, formatPercent } from '@/lib/money';

export default function MembersScreen() {
  const { user } = useAuth();
  const d = useData();
  if (!user) return null;

  const fund = d.totalFund();
  const ranked = [...d.members]
    .map((m) => ({ member: m, savings: d.memberSavings(m.id) }))
    .sort((a, b) => b.savings - a.savings);

  return (
    <Screen>
      <PageHeader title="Group" subtitle={d.settings.groupName.toUpperCase()} />

      <Card style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text variant="label" color="textSecondary">
            TOTAL FUND
          </Text>
          <Text variant="h2" color="primary">
            {formatMoney(fund)}
          </Text>
        </View>
        <View style={styles.vline} />
        <View style={styles.summaryItem}>
          <Text variant="label" color="textSecondary">
            MEMBERS
          </Text>
          <Text variant="h2">{d.members.length}</Text>
        </View>
      </Card>

      <Text variant="label" color="textSecondary" style={styles.sectionLabel}>
        CONTRIBUTIONS BY MEMBER
      </Text>

      {ranked.map((r, i) => {
        const pct = fund > 0 ? r.savings / fund : 0;
        const isMe = r.member.id === user.id;
        const color = theme.colors.chart[i % theme.colors.chart.length];
        return (
          <Card key={r.member.id} compact style={styles.memberCard}>
            <View style={styles.memberTop}>
              <View style={styles.rankWrap}>
                <Text variant="tiny" color="textMuted">
                  #{i + 1}
                </Text>
              </View>
              <Avatar name={r.member.fullName} color={r.member.avatarColor} size={42} ring={isMe} />
              <View style={styles.flex}>
                <View style={styles.nameRow}>
                  <Text variant="bodyStrong" numberOfLines={1}>
                    {isMe ? 'You' : r.member.fullName}
                  </Text>
                  {r.member.role === 'admin' ? <Badge label="Admin" tone="primary" /> : null}
                </View>
                <Text variant="small" color="textMuted">
                  of the group fund
                </Text>
              </View>
              <Text variant="h2" color="primary">
                {formatPercent(pct)}
              </Text>
            </View>
            <ProgressBar value={pct} color={color} style={styles.bar} />
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  summary: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.lg },
  summaryItem: { flex: 1, gap: 2 },
  vline: { width: StyleSheet.hairlineWidth, height: 40, backgroundColor: theme.colors.border, marginHorizontal: theme.spacing.md },
  sectionLabel: { marginBottom: theme.spacing.sm },
  memberCard: { marginBottom: theme.spacing.md },
  memberTop: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  rankWrap: { width: 22, alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bar: { marginTop: theme.spacing.md },
});
