import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/PageHeader';
import { Avatar, Button, Card, EmptyState, Input, Screen, Text } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';
import { useData } from '@/data/store';
import { Contribution } from '@/data/types';
import { formatDate, formatPeriod } from '@/lib/date';
import { formatMoney, parseAmount } from '@/lib/money';

export default function VerifyDeposits() {
  const { user } = useAuth();
  const d = useData();
  if (!user) return null;

  const pending = d.pendingContributions();

  return (
    <Screen>
      <PageHeader title="Verify deposits" subtitle="ADMIN" back />
      {pending.length === 0 ? (
        <EmptyState
          icon="checkmark-done-outline"
          title="All caught up"
          message="There are no deposits waiting to be verified. New submissions will appear here."
        />
      ) : (
        <>
          <Text variant="small" color="textSecondary" style={styles.intro}>
            Confirm the money reached the group account, then approve the amount (edit it if it
            differs from the receipt) or reject the submission.
          </Text>
          {pending.map((c) => (
            <VerifyItem key={c.id} contribution={c} verifierId={user.id} />
          ))}
        </>
      )}
    </Screen>
  );
}

function VerifyItem({ contribution: c, verifierId }: { contribution: Contribution; verifierId: string }) {
  const d = useData();
  const member = d.memberById(c.memberId);
  const [amountText, setAmountText] = useState(String(c.submittedAmount));
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const amount = parseAmount(amountText);
  const edited = amount !== c.submittedAmount;

  return (
    <Card style={styles.item}>
      <View style={styles.header}>
        <Avatar name={member?.fullName ?? '?'} color={member?.avatarColor} size={40} />
        <View style={styles.flex}>
          <Text variant="bodyStrong">{member?.fullName}</Text>
          <Text variant="small" color="textMuted">
            {formatPeriod(c.period)} · {formatDate(c.createdAt)}
          </Text>
        </View>
      </View>

      {c.receiptUri ? (
        <Image source={{ uri: c.receiptUri }} style={styles.receipt} contentFit="cover" transition={150} />
      ) : (
        <View style={[styles.receipt, styles.noReceipt]}>
          <Ionicons name="document-text-outline" size={28} color={theme.colors.textMuted} />
          <Text variant="small" color="textMuted">
            No receipt attached
          </Text>
        </View>
      )}

      {c.note ? (
        <View style={styles.noteRow}>
          <Ionicons name="chatbubble-ellipses-outline" size={14} color={theme.colors.textMuted} />
          <Text variant="small" color="textSecondary" style={styles.flex}>
            {c.note}
          </Text>
        </View>
      ) : null}

      <View style={styles.submittedRow}>
        <Text variant="small" color="textSecondary">
          Member entered
        </Text>
        <Text variant="bodyStrong">{formatMoney(c.submittedAmount)}</Text>
      </View>

      {rejecting ? (
        <View style={styles.rejectBox}>
          <Input
            label="Reason for rejecting"
            placeholder="e.g. Amount not received on the account"
            value={reason}
            onChangeText={setReason}
          />
          <View style={styles.actionRow}>
            <Button title="Cancel" variant="outline" style={styles.flex} onPress={() => setRejecting(false)} />
            <Button
              title="Confirm reject"
              variant="danger"
              style={styles.flex}
              onPress={() => d.rejectContribution(c.id, reason.trim() || 'Not verified', verifierId)}
            />
          </View>
        </View>
      ) : (
        <>
          <Input
            label="Approve this amount"
            keyboardType="numeric"
            value={amountText}
            onChangeText={setAmountText}
            hint={edited ? `Changed from ${formatMoney(c.submittedAmount)}` : 'Matches the submitted amount'}
            prefix={
              <Text variant="bodyStrong" color="textSecondary" style={styles.prefix}>
                USh
              </Text>
            }
          />
          <View style={styles.actionRow}>
            <Button title="Reject" variant="outline" icon="close" style={styles.flex} onPress={() => setRejecting(true)} />
            <Button
              title={edited ? 'Approve edited' : 'Approve'}
              icon="checkmark"
              style={styles.flex}
              onPress={() => d.verifyContribution(c.id, amount, verifierId)}
            />
          </View>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  intro: { marginBottom: theme.spacing.lg },
  item: { marginBottom: theme.spacing.lg, gap: theme.spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  receipt: { width: '100%', height: 260, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceSunken },
  noReceipt: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  noteRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  submittedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.surfaceMuted, padding: theme.spacing.md, borderRadius: theme.radius.md },
  rejectBox: { gap: theme.spacing.md },
  actionRow: { flexDirection: 'row', gap: theme.spacing.md },
  prefix: { marginRight: 8 },
});
