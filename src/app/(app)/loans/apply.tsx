import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/PageHeader';
import { Avatar, Button, Card, Divider, Input, ProgressBar, Screen, Text } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';
import { useData } from '@/data/store';
import { formatMoney, formatMoneyCompact, formatPercent, parseAmount } from '@/lib/money';

export default function ApplyLoan() {
  const router = useRouter();
  const { user } = useAuth();
  const d = useData();
  const [amountText, setAmountText] = useState('');
  const [reason, setReason] = useState('');
  const [trusteeId, setTrusteeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!user) return null;

  const savings = d.memberSavings(user.id);
  const elig = d.eligibilityFor(user.id);
  const amount = parseAmount(amountText);
  const others = d.members.filter((m) => m.id !== user.id);

  const overMax = amount > elig.maxLoan;
  const needsVote = amount > savings;
  const utilisation = elig.maxLoan > 0 ? Math.min(1, amount / elig.maxLoan) : 0;

  const setPreset = (fraction: number) =>
    setAmountText(String(Math.floor((elig.maxLoan * fraction) / 1000) * 1000));

  const onSubmit = () => {
    setError(null);
    if (amount <= 0) return setError('Enter how much you want to borrow.');
    if (overMax) return setError(`The most you can borrow right now is ${formatMoney(elig.maxLoan)}.`);
    if (!reason.trim()) return setError('Add a reason — the group sees this when deciding.');
    if (!trusteeId) return setError('Choose a trustee who will stand for your loan.');
    const loan = d.applyLoan({ borrowerId: user.id, principal: amount, reason: reason.trim(), trusteeId });
    router.replace({ pathname: '/(app)/loans/[id]', params: { id: loan.id } });
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen footer={<Button title="Submit application" icon="paper-plane-outline" onPress={onSubmit} />}>
        <PageHeader title="Apply for a loan" subtitle="NEW REQUEST" back />

        {/* Eligibility */}
        <Card style={styles.eligCard}>
          <View style={styles.eligHead}>
            <Text variant="label" color="textSecondary">
              YOU CAN BORROW UP TO
            </Text>
            <Ionicons name="shield-checkmark" size={16} color={theme.colors.primary} />
          </View>
          <Text variant="display" color="primary">
            {formatMoney(elig.maxLoan)}
          </Text>
          <ProgressBar value={utilisation} style={styles.eligBar} color={overMax ? theme.colors.danger : theme.colors.primary} />
          <Divider style={styles.divider} />
          <CapRow
            label="1.5× your savings"
            value={formatMoneyCompact(elig.personalCap)}
            active={elig.binding === 'personal'}
            caption={`Savings ${formatMoneyCompact(savings)}`}
          />
          <CapRow
            label="Fund reserve limit"
            value={formatMoneyCompact(elig.reserveCap)}
            active={elig.binding === 'reserve'}
            caption="Keeps 50% in the fund"
          />
          <Text variant="tiny" color="textMuted" style={styles.capNote}>
            Your limit is the smaller of the two.
          </Text>
        </Card>

        {/* Amount */}
        <Card style={styles.card}>
          <Input
            label="How much do you need?"
            keyboardType="numeric"
            placeholder="0"
            value={amountText}
            onChangeText={setAmountText}
            error={overMax ? `Maximum is ${formatMoney(elig.maxLoan)}` : undefined}
            hint={!overMax && amount > 0 ? formatMoney(amount) : undefined}
            prefix={
              <Text variant="bodyStrong" color="textSecondary" style={styles.prefix}>
                USh
              </Text>
            }
          />
          <View style={styles.presetRow}>
            {[
              { label: '25%', f: 0.25 },
              { label: '50%', f: 0.5 },
              { label: 'Max', f: 1 },
            ].map((p) => (
              <Pressable key={p.label} style={styles.preset} onPress={() => setPreset(p.f)}>
                <Text variant="label" color="primary">
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {amount > 0 && !overMax ? (
            <View style={[styles.approvalNote, needsVote ? styles.voteNote : styles.adminNote]}>
              <Ionicons
                name={needsVote ? 'people-outline' : 'flash-outline'}
                size={16}
                color={needsVote ? theme.colors.info : theme.colors.success}
              />
              <Text variant="small" style={styles.flex} color={needsVote ? 'textSecondary' : 'textSecondary'}>
                {needsVote
                  ? 'This is more than your savings, so every member must approve it.'
                  : 'This is within your savings — the admin can approve it directly.'}
              </Text>
            </View>
          ) : null}
        </Card>

        {/* Reason */}
        <Card style={styles.card}>
          <Input
            label="Reason for the loan"
            placeholder="What will you use it for? The whole group sees this."
            value={reason}
            onChangeText={setReason}
            multiline
            style={styles.reason}
          />
        </Card>

        {/* Trustee */}
        <Card style={styles.card}>
          <Text variant="label" color="textSecondary">
            CHOOSE A TRUSTEE
          </Text>
          <Text variant="small" color="textMuted" style={styles.trusteeHint}>
            Your trustee reminds you about repayments and covers the loan if you cannot pay.
          </Text>
          <View style={styles.trusteeList}>
            {others.map((m) => {
              const selected = m.id === trusteeId;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setTrusteeId(m.id)}
                  style={[styles.trustee, selected && styles.trusteeSelected]}>
                  <Avatar name={m.fullName} color={m.avatarColor} size={30} />
                  <Text variant="small" color={selected ? 'primary' : 'text'} style={styles.trusteeName}>
                    {m.fullName}
                  </Text>
                  {selected ? <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        </Card>

        {error ? (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={16} color={theme.colors.danger} />
            <Text variant="small" color="danger" style={styles.flex}>
              {error}
            </Text>
          </View>
        ) : null}

        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={16} color={theme.colors.textMuted} />
          <Text variant="small" color="textMuted" style={styles.flex}>
            After you apply, the admin sets the interest rate and repayment period. The full
            repayment amount then shows on everyone’s dashboard.
          </Text>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function CapRow({
  label,
  value,
  active,
  caption,
}: {
  label: string;
  value: string;
  active: boolean;
  caption: string;
}) {
  return (
    <View style={styles.capRow}>
      <View style={[styles.capDot, active && styles.capDotActive]} />
      <View style={styles.flex}>
        <Text variant="small" color={active ? 'text' : 'textSecondary'}>
          {label}
        </Text>
        <Text variant="tiny" color="textMuted">
          {caption}
        </Text>
      </View>
      <Text variant="bodyStrong" color={active ? 'primary' : 'textSecondary'}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  eligCard: { marginBottom: theme.spacing.md },
  eligHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eligBar: { marginTop: theme.spacing.sm },
  divider: { marginVertical: theme.spacing.md },
  capRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: 6 },
  capDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.border },
  capDotActive: { backgroundColor: theme.colors.primary },
  capNote: { marginTop: 6 },
  card: { marginBottom: theme.spacing.md, gap: theme.spacing.sm },
  prefix: { marginRight: 8 },
  presetRow: { flexDirection: 'row', gap: theme.spacing.sm },
  preset: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primarySurface,
  },
  approvalNote: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: theme.spacing.md, borderRadius: theme.radius.md },
  voteNote: { backgroundColor: theme.colors.infoBg },
  adminNote: { backgroundColor: theme.colors.successBg },
  reason: { minHeight: 70, textAlignVertical: 'top' },
  trusteeHint: { marginBottom: theme.spacing.xs },
  trusteeList: { gap: theme.spacing.sm },
  trustee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    paddingRight: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  trusteeSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySurface },
  trusteeName: { flex: 1 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: theme.spacing.sm },
  infoRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: theme.spacing.xs },
});
