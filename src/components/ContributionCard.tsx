import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Badge, Card, Text } from '@/components/ui';
import { theme } from '@/constants/theme';
import { Contribution, Member } from '@/data/types';
import { formatDate } from '@/lib/date';
import { formatPeriod } from '@/lib/date';
import { CONTRIBUTION_STATUS } from '@/lib/status';
import { formatMoney } from '@/lib/money';

interface ContributionCardProps {
  contribution: Contribution;
  /** When provided, shows who made the deposit (admin view). */
  member?: Member;
  onPress?: () => void;
}

export function ContributionCard({ contribution: c, member, onPress }: ContributionCardProps) {
  const status = CONTRIBUTION_STATUS[c.status];
  const amount = c.status === 'approved' ? c.approvedAmount ?? c.submittedAmount : c.submittedAmount;
  const edited = c.status === 'approved' && c.approvedAmount != null && c.approvedAmount !== c.submittedAmount;

  return (
    <Card compact onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        {c.receiptUri ? (
          <Image source={{ uri: c.receiptUri }} style={styles.thumb} contentFit="cover" transition={150} />
        ) : (
          <View style={[styles.thumb, styles.noThumb]}>
            <Ionicons name="document-text-outline" size={20} color={theme.colors.textMuted} />
          </View>
        )}

        <View style={styles.flex}>
          <View style={styles.topRow}>
            {member ? (
              <View style={styles.memberRow}>
                <Avatar name={member.fullName} color={member.avatarColor} size={22} />
                <Text variant="bodyStrong" numberOfLines={1}>
                  {member.fullName}
                </Text>
              </View>
            ) : (
              <Text variant="bodyStrong">{formatPeriod(c.period)}</Text>
            )}
            <Badge label={status.label} tone={status.tone} icon={status.icon} />
          </View>

          <Text variant="h3" style={styles.amount}>
            {formatMoney(amount)}
          </Text>

          <Text variant="small" color="textMuted">
            {member ? `${formatPeriod(c.period)} · ` : ''}
            {formatDate(c.createdAt)}
            {edited ? ` · edited from ${formatMoney(c.submittedAmount)}` : ''}
          </Text>

          {c.status === 'rejected' && c.rejectionReason ? (
            <Text variant="small" color="danger" style={styles.reason}>
              {c.rejectionReason}
            </Text>
          ) : null}
        </View>

        {onPress ? <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  thumb: { width: 54, height: 54, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceSunken },
  noThumb: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 2 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  amount: { marginTop: 2 },
  reason: { marginTop: 2 },
});
