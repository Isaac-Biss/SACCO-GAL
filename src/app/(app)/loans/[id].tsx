import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { GradientCard } from '@/components/GradientCard';
import { PageHeader } from '@/components/PageHeader';
import { Avatar, Badge, Button, Card, Divider, Input, ProgressBar, Screen, Text } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';
import { useData } from '@/data/store';
import { formatDate } from '@/lib/date';
import { computeLoan } from '@/lib/loan';
import { formatMoney, formatPercent, parseAmount } from '@/lib/money';
import { LOAN_STATUS } from '@/lib/status';

export default function LoanDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const d = useData();

  const loan = d.loanById(id);
  const [rateText, setRateText] = useState(String(Math.round(d.settings.defaultInterestRate * 100)));
  const [termText, setTermText] = useState('6');
  const [showSchedule, setShowSchedule] = useState(false);
  const [repayOpen, setRepayOpen] = useState(false);
  const [repayText, setRepayText] = useState('');

  if (!user) return null;
  if (!loan) {
    return (
      <Screen>
        <PageHeader title="Loan" back />
        <Text color="textSecondary">This loan could not be found.</Text>
      </Screen>
    );
  }

  const borrower = d.memberById(loan.borrowerId);
  const trustee = d.memberById(loan.trusteeId);
  const borrowerSavings = d.memberSavings(loan.borrowerId);
  const status = LOAN_STATUS[loan.status];
  const hasTerms = loan.interestRate != null && loan.termMonths != null;
  const calc = hasTerms ? computeLoan(loan.principal, loan.interestRate!, loan.termMonths!) : null;

  const isBorrower = loan.borrowerId === user.id;
  const voters = d.voterCountFor(loan);
  const approvals = loan.votes.filter((v) => v.vote === 'approve').length;
  const myVote = loan.votes.find((v) => v.memberId === user.id);
  const canVote = loan.status === 'pending_members' && !isBorrower && !myVote;

  // admin set-terms preview
  const previewRate = (parseFloat(rateText) || 0) / 100;
  const previewTerm = Math.max(1, Math.round(parseFloat(termText) || 0));
  const preview = computeLoan(loan.principal, previewRate, previewTerm);
  const needsVote = loan.principal > borrowerSavings;

  const outstanding = calc ? Math.max(0, calc.totalRepayable - loan.amountRepaid) : 0;

  const saveTerms = () => {
    Keyboard.dismiss();
    if (previewRate <= 0) return Alert.alert('Set an interest rate', 'Enter a monthly interest rate greater than zero.');
    d.setLoanTerms(loan.id, previewRate, previewTerm, user.id);
  };

  const submitRepayment = () => {
    Keyboard.dismiss();
    const amt = parseAmount(repayText);
    if (amt <= 0) return;
    d.recordRepayment(loan.id, amt);
    setRepayText('');
    setRepayOpen(false);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
      <PageHeader title="Loan details" subtitle="LOAN" back />

      {/* Hero */}
      <GradientCard style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroBorrower}>
            <Avatar name={borrower?.fullName ?? '?'} color="#ffffff33" size={34} />
            <Text style={styles.heroName}>{isBorrower ? 'You' : borrower?.fullName}</Text>
          </View>
          <Badge label={status.label} tone="neutral" icon={status.icon} />
        </View>
        <Text style={styles.heroLabel}>PRINCIPAL REQUESTED</Text>
        <Text style={styles.heroValue}>{formatMoney(loan.principal)}</Text>
        {calc ? (
          <Text style={styles.heroSub}>
            Repays {formatMoney(calc.totalRepayable)} over {loan.termMonths} months
          </Text>
        ) : null}
      </GradientCard>

      {/* Reason */}
      <Card style={styles.card}>
        <Text variant="label" color="textSecondary">
          REASON
        </Text>
        <Text variant="body" style={styles.reason}>
          {loan.reason}
        </Text>
        <Text variant="tiny" color="textMuted">
          Applied {formatDate(loan.createdAt)}
        </Text>
      </Card>

      {/* People */}
      <Card style={styles.card}>
        <PersonRow role="BORROWER" member={borrower} caption={`${formatMoney(borrowerSavings)} saved`} you={isBorrower} />
        <Divider style={styles.divider} />
        <PersonRow role="TRUSTEE" member={trustee} caption="Reminds & guarantees repayment" you={trustee?.id === user.id} />
      </Card>

      {/* Terms */}
      {calc ? (
        <Card style={styles.card}>
          <Text variant="h3" style={styles.sectionTitle}>
            Repayment terms
          </Text>
          <View style={styles.termGrid}>
            <TermCell label="Interest / month" value={formatPercent(loan.interestRate!, 1)} />
            <TermCell label="Term" value={`${loan.termMonths} months`} />
            <TermCell label="Monthly" value={formatMoney(calc.monthlyPayment)} />
            <TermCell label="Total interest" value={formatMoney(calc.totalInterest)} />
          </View>
          <View style={styles.totalRow}>
            <Text variant="bodyStrong">Total repayable</Text>
            <Text variant="h3" color="primary">
              {formatMoney(calc.totalRepayable)}
            </Text>
          </View>
          <Text variant="tiny" color="textMuted" style={styles.compoundNote}>
            Compounded monthly at {formatPercent(loan.interestRate!, 1)}.
          </Text>

          {loan.status === 'active' || loan.status === 'repaid' ? (
            <View style={styles.repaidBox}>
              <View style={styles.rowBetween}>
                <Text variant="small" color="textSecondary">
                  Repaid {formatMoney(loan.amountRepaid)}
                </Text>
                <Text variant="small" color="textSecondary">
                  {formatMoney(outstanding)} left
                </Text>
              </View>
              <ProgressBar value={calc.totalRepayable > 0 ? loan.amountRepaid / calc.totalRepayable : 0} style={styles.repaidBar} />
              {loan.dueDate ? (
                <Text variant="tiny" color="textMuted">
                  Due by {formatDate(loan.dueDate)}
                </Text>
              ) : null}
            </View>
          ) : null}

          <Pressable style={styles.scheduleToggle} onPress={() => setShowSchedule((s) => !s)}>
            <Text variant="label" color="primary">
              {showSchedule ? 'Hide' : 'Show'} repayment schedule
            </Text>
            <Ionicons name={showSchedule ? 'chevron-up' : 'chevron-down'} size={16} color={theme.colors.primary} />
          </Pressable>
          {showSchedule ? (
            <View style={styles.schedule}>
              <View style={styles.schedHead}>
                <Text variant="tiny" color="textMuted" style={styles.schMonth}>
                  MONTH
                </Text>
                <Text variant="tiny" color="textMuted" style={styles.schCol}>
                  PAYMENT
                </Text>
                <Text variant="tiny" color="textMuted" style={styles.schCol}>
                  BALANCE
                </Text>
              </View>
              {calc.schedule.map((row) => (
                <View key={row.month} style={styles.schRow}>
                  <Text variant="small" style={styles.schMonth}>
                    {row.month}
                  </Text>
                  <Text variant="small" color="textSecondary" style={styles.schCol}>
                    {formatMoney(row.payment)}
                  </Text>
                  <Text variant="small" color="textSecondary" style={styles.schCol}>
                    {formatMoney(row.closingBalance)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </Card>
      ) : null}

      {/* Admin: set terms */}
      {loan.status === 'pending_terms' && isAdmin ? (
        <Card style={styles.card}>
          <Text variant="h3" style={styles.sectionTitle}>
            Set loan terms
          </Text>
          <View style={styles.termInputs}>
            <View style={styles.flex}>
              <Input
                label="Interest / month"
                keyboardType="numeric"
                value={rateText}
                onChangeText={setRateText}
                prefix={null}
                style={styles.termInput}
              />
              <Text variant="tiny" color="textMuted" style={styles.inlineUnit}>
                % per month, compounded
              </Text>
            </View>
            <View style={styles.flex}>
              <Input label="Term" keyboardType="numeric" value={termText} onChangeText={setTermText} style={styles.termInput} />
              <Text variant="tiny" color="textMuted" style={styles.inlineUnit}>
                months
              </Text>
            </View>
          </View>
          <View style={styles.previewBox}>
            <View style={styles.rowBetween}>
              <Text variant="small" color="textSecondary">
                Total repayable
              </Text>
              <Text variant="bodyStrong">{formatMoney(preview.totalRepayable)}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text variant="small" color="textSecondary">
                Monthly instalment
              </Text>
              <Text variant="bodyStrong">{formatMoney(preview.monthlyPayment)}</Text>
            </View>
          </View>
          <View style={[styles.approvalNote, needsVote ? styles.voteNote : styles.adminNote]}>
            <Ionicons name={needsVote ? 'people-outline' : 'flash-outline'} size={16} color={needsVote ? theme.colors.info : theme.colors.success} />
            <Text variant="small" color="textSecondary" style={styles.flex}>
              {needsVote
                ? 'Above the borrower’s savings — saving terms sends it to all members for a vote.'
                : 'Within the borrower’s savings — saving terms approves the loan directly.'}
            </Text>
          </View>
          <Button
            title={needsVote ? 'Save terms & send to vote' : 'Save terms & approve'}
            icon="checkmark-circle-outline"
            onPress={saveTerms}
          />
        </Card>
      ) : null}

      {loan.status === 'pending_terms' && !isAdmin ? (
        <Card flat style={styles.waitCard}>
          <Ionicons name="time-outline" size={18} color={theme.colors.warning} />
          <Text variant="small" color="textSecondary" style={styles.flex}>
            Waiting for the admin to set the interest rate and repayment period.
          </Text>
        </Card>
      ) : null}

      {/* Votes */}
      {loan.requiresMemberVote && loan.status !== 'pending_terms' ? (
        <Card style={styles.card}>
          <View style={styles.rowBetween}>
            <Text variant="h3">Member approval</Text>
            <Text variant="label" color="textSecondary">
              {approvals}/{voters} approved
            </Text>
          </View>
          <ProgressBar value={voters > 0 ? approvals / voters : 0} style={styles.voteBar} color={theme.colors.success} />
          <View style={styles.voteList}>
            {d.members
              .filter((m) => m.id !== loan.borrowerId)
              .map((m) => {
                const v = loan.votes.find((x) => x.memberId === m.id);
                const icon = v?.vote === 'approve' ? 'checkmark-circle' : v?.vote === 'reject' ? 'close-circle' : 'ellipse-outline';
                const color =
                  v?.vote === 'approve' ? theme.colors.success : v?.vote === 'reject' ? theme.colors.danger : theme.colors.textMuted;
                return (
                  <View key={m.id} style={styles.voterRow}>
                    <Avatar name={m.fullName} color={m.avatarColor} size={28} />
                    <Text variant="small" style={styles.flex}>
                      {m.id === user.id ? 'You' : m.fullName}
                    </Text>
                    <Ionicons name={icon as any} size={18} color={color} />
                  </View>
                );
              })}
          </View>
        </Card>
      ) : null}

      {/* Actions */}
      {canVote ? (
        <View style={styles.actions}>
          <Text variant="small" color="textSecondary" center style={styles.voteAsk}>
            Do you approve this loan for {borrower?.fullName}?
          </Text>
          <View style={styles.actionRow}>
            <Button title="Reject" variant="danger" icon="close" style={styles.flex} onPress={() => d.castVote(loan.id, user.id, 'reject')} />
            <Button title="Approve" icon="checkmark" style={styles.flex} onPress={() => d.castVote(loan.id, user.id, 'approve')} />
          </View>
        </View>
      ) : null}

      {myVote && loan.status === 'pending_members' ? (
        <Card flat style={styles.waitCard}>
          <Ionicons name={myVote.vote === 'approve' ? 'checkmark-circle' : 'close-circle'} size={18} color={myVote.vote === 'approve' ? theme.colors.success : theme.colors.danger} />
          <Text variant="small" color="textSecondary" style={styles.flex}>
            You {myVote.vote === 'approve' ? 'approved' : 'rejected'} this loan. Waiting for the other members.
          </Text>
        </Card>
      ) : null}

      {/* Admin: disburse */}
      {loan.status === 'approved' && isAdmin ? (
        <View style={styles.actions}>
          <Card flat style={styles.waitCard}>
            <Ionicons name="checkmark-done-circle" size={18} color={theme.colors.success} />
            <Text variant="small" color="textSecondary" style={styles.flex}>
              Approved. Release the money and mark it disbursed to start the repayment clock.
            </Text>
          </Card>
          <Button title="Mark as disbursed" icon="send-outline" onPress={() => d.disburseLoan(loan.id, user.id)} />
        </View>
      ) : null}

      {/* Record repayment */}
      {loan.status === 'active' && (isAdmin || isBorrower) ? (
        <View style={styles.actions}>
          {repayOpen ? (
            <Card style={styles.card}>
              <Input
                label="Repayment amount"
                keyboardType="numeric"
                value={repayText}
                onChangeText={setRepayText}
                placeholder="0"
                hint={`${formatMoney(outstanding)} outstanding`}
                prefix={<Text variant="bodyStrong" color="textSecondary" style={styles.prefix}>USh</Text>}
              />
              <View style={styles.actionRow}>
                <Button title="Cancel" variant="outline" style={styles.flex} onPress={() => setRepayOpen(false)} />
                <Button title="Record" icon="checkmark" style={styles.flex} onPress={submitRepayment} />
              </View>
            </Card>
          ) : (
            <Button title="Record a repayment" variant="secondary" icon="add-circle-outline" onPress={() => setRepayOpen(true)} />
          )}
        </View>
      ) : null}

      {/* Admin: reject pending */}
      {(loan.status === 'pending_terms' || loan.status === 'pending_members') && isAdmin ? (
        <View style={styles.actions}>
          <Button
            title="Reject application"
            variant="outline"
            icon="close-circle-outline"
            onPress={() =>
              Alert.alert('Reject loan?', 'This will decline the application.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reject', style: 'destructive', onPress: () => d.rejectLoan(loan.id, user.id) },
              ])
            }
          />
        </View>
      ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

function PersonRow({ role, member, caption, you }: { role: string; member?: { fullName: string; avatarColor: string }; caption: string; you?: boolean }) {
  return (
    <View style={styles.personRow}>
      <Avatar name={member?.fullName ?? '?'} color={member?.avatarColor} size={40} />
      <View style={styles.flex}>
        <Text variant="tiny" color="textMuted">
          {role}
        </Text>
        <Text variant="bodyStrong">{you ? 'You' : member?.fullName ?? 'Unknown'}</Text>
      </View>
      <Text variant="small" color="textMuted" style={styles.personCaption}>
        {caption}
      </Text>
    </View>
  );
}

function TermCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.termCell}>
      <Text variant="tiny" color="textMuted">
        {label.toUpperCase()}
      </Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { marginBottom: theme.spacing.md },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg },
  heroBorrower: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  heroValue: { color: '#fff', fontSize: 34, lineHeight: 40, fontWeight: '800', marginTop: 4 },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 6 },
  card: { marginBottom: theme.spacing.md, gap: theme.spacing.sm },
  reason: { marginVertical: 2 },
  divider: { marginVertical: theme.spacing.md },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  personCaption: { maxWidth: 130, textAlign: 'right' },
  sectionTitle: { marginBottom: theme.spacing.xs },
  termGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  termCell: { width: '50%', paddingVertical: 8, gap: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.border },
  compoundNote: { marginTop: 2 },
  repaidBox: { marginTop: theme.spacing.md, backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.md, padding: theme.spacing.md, gap: 6 },
  repaidBar: {},
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scheduleToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: theme.spacing.sm },
  schedule: { marginTop: theme.spacing.sm, backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.md, padding: theme.spacing.md },
  schedHead: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
  schRow: { flexDirection: 'row', paddingVertical: 6 },
  schMonth: { width: 50 },
  schCol: { flex: 1, textAlign: 'right' },
  termInputs: { flexDirection: 'row', gap: theme.spacing.md },
  termInput: {},
  inlineUnit: { marginTop: 4, marginLeft: 2 },
  previewBox: { backgroundColor: theme.colors.primarySurface, borderRadius: theme.radius.md, padding: theme.spacing.md, gap: 6, marginTop: theme.spacing.xs },
  approvalNote: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: theme.spacing.md, borderRadius: theme.radius.md },
  voteNote: { backgroundColor: theme.colors.infoBg },
  adminNote: { backgroundColor: theme.colors.successBg },
  waitCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: theme.spacing.md },
  voteBar: { marginTop: theme.spacing.xs },
  voteList: { gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  voterRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  actions: { gap: theme.spacing.md, marginBottom: theme.spacing.md },
  actionRow: { flexDirection: 'row', gap: theme.spacing.md },
  voteAsk: {},
  prefix: { marginRight: 8 },
});
