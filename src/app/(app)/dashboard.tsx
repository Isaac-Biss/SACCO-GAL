import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Donut } from '@/components/charts/Donut';
import { GradientCard } from '@/components/GradientCard';
import { Avatar, Badge, Button, Card, Divider, ProgressBar, Screen, StatCard, Text } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';
import { useData } from '@/data/store';
import { computeLoan } from '@/lib/loan';
import { formatMoney, formatMoneyCompact, formatPercent } from '@/lib/money';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const d = useData();
  if (!user) return null;

  const savings = d.memberSavings(user.id);
  const share = d.memberPercent(user.id);
  const fund = d.totalFund();
  const available = d.availableCash();

  const ranked = [...d.members]
    .map((m) => ({ member: m, savings: d.memberSavings(m.id) }))
    .sort((a, b) => b.savings - a.savings);
  const myRank = ranked.findIndex((r) => r.member.id === user.id) + 1;

  const slices = ranked.map((r, i) => ({
    value: r.savings,
    color: theme.colors.chart[i % theme.colors.chart.length],
  }));

  const toVote = d.loansAwaitingVote(user.id);
  const myLoans = d.loansByBorrower(user.id);
  const activeLoan = myLoans.find((l) => l.status === 'active' || l.status === 'approved');
  const pendingVerifications = isAdmin ? d.pendingContributions().length : 0;
  const loansNeedingTerms = isAdmin
    ? d.loans.filter((l) => l.status === 'pending_terms').length
    : 0;

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text variant="label" color="textSecondary">
            {greeting()},
          </Text>
          <Text variant="h1">{user.fullName.split(' ')[0]}</Text>
        </View>
        <Pressable onPress={() => router.push('/(app)/profile')}>
          <Avatar name={user.fullName} color={user.avatarColor} size={46} ring />
        </Pressable>
      </View>

      {/* Hero — your savings & share */}
      <GradientCard>
        <View style={styles.heroTop}>
          <Text variant="label" style={styles.heroLabel}>
            YOUR SAVINGS
          </Text>
          {isAdmin ? <Badge label="Admin" tone="neutral" icon="shield-checkmark" /> : null}
        </View>
        <Text style={styles.heroValue}>{formatMoney(savings)}</Text>
        <View style={styles.heroShareRow}>
          <View style={styles.heroPill}>
            <Ionicons name="pie-chart" size={13} color="#fff" />
            <Text style={styles.heroPillText}>{formatPercent(share)} of fund</Text>
          </View>
          <View style={styles.heroPill}>
            <Ionicons name="trophy" size={13} color="#fff" />
            <Text style={styles.heroPillText}>
              #{myRank} of {d.members.length}
            </Text>
          </View>
        </View>
        <View style={styles.heroBarTrack}>
          <View style={[styles.heroBarFill, { width: `${Math.max(2, share * 100)}%` }]} />
        </View>
        <Text style={styles.heroCaption}>of {formatMoney(fund)} total group fund</Text>
      </GradientCard>

      {/* Fund stats */}
      <View style={styles.statRow}>
        <StatCard label="Group fund" value={formatMoneyCompact(fund)} icon="people" caption={`${d.members.length} members`} />
        <StatCard label="Available cash" value={formatMoneyCompact(available)} icon="cash" caption="ready to lend" tone="primary" />
      </View>

      {/* Attention: votes */}
      {toVote.length > 0 ? (
        <Card style={styles.attentionCard}>
          <View style={styles.rowBetween}>
            <View style={styles.rowCenter}>
              <View style={styles.attnIcon}>
                <Ionicons name="hand-left" size={16} color={theme.colors.primary} />
              </View>
              <Text variant="h3">Loans need your vote</Text>
            </View>
            <Badge label={String(toVote.length)} tone="info" />
          </View>
          <View style={styles.voteList}>
            {toVote.map((loan) => {
              const borrower = d.memberById(loan.borrowerId);
              const calc =
                loan.interestRate != null && loan.termMonths != null
                  ? computeLoan(loan.principal, loan.interestRate, loan.termMonths)
                  : null;
              return (
                <Pressable
                  key={loan.id}
                  style={styles.voteItem}
                  onPress={() => router.push({ pathname: '/(app)/loans/[id]', params: { id: loan.id } })}>
                  <Avatar name={borrower?.fullName ?? '?'} color={borrower?.avatarColor} size={38} />
                  <View style={styles.flex}>
                    <Text variant="bodyStrong">{borrower?.fullName}</Text>
                    <Text variant="small" color="textSecondary" numberOfLines={1}>
                      Wants {formatMoney(loan.principal)}
                      {calc ? ` · repays ${formatMoneyCompact(calc.totalRepayable)}` : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                </Pressable>
              );
            })}
          </View>
        </Card>
      ) : null}

      {/* Attention: admin tasks */}
      {isAdmin && (pendingVerifications > 0 || loansNeedingTerms > 0) ? (
        <Card style={styles.attentionCard}>
          <View style={styles.rowCenter}>
            <View style={styles.attnIcon}>
              <Ionicons name="shield-checkmark" size={16} color={theme.colors.primary} />
            </View>
            <Text variant="h3">Admin tasks</Text>
          </View>
          {pendingVerifications > 0 ? (
            <Pressable style={styles.adminTask} onPress={() => router.push('/(app)/admin/verify')}>
              <Ionicons name="receipt-outline" size={18} color={theme.colors.text} />
              <Text variant="body" style={styles.flex}>
                Verify {pendingVerifications} deposit{pendingVerifications > 1 ? 's' : ''}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </Pressable>
          ) : null}
          {loansNeedingTerms > 0 ? (
            <Pressable style={styles.adminTask} onPress={() => router.push('/(app)/admin')}>
              <Ionicons name="construct-outline" size={18} color={theme.colors.text} />
              <Text variant="body" style={styles.flex}>
                Set terms on {loansNeedingTerms} loan{loansNeedingTerms > 1 ? 's' : ''}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </Pressable>
          ) : null}
        </Card>
      ) : null}

      {/* Your active loan */}
      {activeLoan && activeLoan.interestRate != null && activeLoan.termMonths != null ? (
        <LoanSummaryCard loan={activeLoan} onPress={() => router.push({ pathname: '/(app)/loans/[id]', params: { id: activeLoan.id } })} />
      ) : null}

      {/* Fund distribution */}
      <Card>
        <Text variant="h3" style={styles.cardTitle}>
          Fund distribution
        </Text>
        <View style={styles.donutWrap}>
          <Donut slices={slices} size={168} thickness={24}>
            <View style={styles.donutCenter}>
              <Text variant="h2">{d.members.length}</Text>
              <Text variant="tiny" color="textMuted">
                MEMBERS
              </Text>
            </View>
          </Donut>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.legend}>
          {ranked.map((r, i) => {
            const pct = fund > 0 ? r.savings / fund : 0;
            const isMe = r.member.id === user.id;
            return (
              <View key={r.member.id} style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: theme.colors.chart[i % theme.colors.chart.length] }]} />
                <Text variant="body" style={styles.flex} numberOfLines={1}>
                  {isMe ? 'You' : r.member.fullName}
                </Text>
                <Text variant="small" color="textSecondary" style={styles.legendPct}>
                  {formatPercent(pct)}
                </Text>
                <Text variant="bodyStrong" style={styles.legendAmt}>
                  {formatMoneyCompact(r.savings)}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Quick actions */}
      <View style={styles.actions}>
        <Button
          title="Add contribution"
          icon="add-circle-outline"
          onPress={() => router.push('/(app)/contributions/new')}
        />
        <Button
          title="Apply for a loan"
          variant="secondary"
          icon="cash-outline"
          onPress={() => router.push('/(app)/loans/apply')}
        />
      </View>
    </Screen>
  );
}

function LoanSummaryCard({ loan, onPress }: { loan: any; onPress: () => void }) {
  const calc = computeLoan(loan.principal, loan.interestRate, loan.termMonths);
  const progress = calc.totalRepayable > 0 ? loan.amountRepaid / calc.totalRepayable : 0;
  return (
    <Card onPress={onPress}>
      <View style={styles.rowBetween}>
        <Text variant="h3">Your active loan</Text>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </View>
      <View style={styles.loanFigs}>
        <View>
          <Text variant="tiny" color="textMuted">
            REPAID
          </Text>
          <Text variant="bodyStrong">{formatMoney(loan.amountRepaid)}</Text>
        </View>
        <View style={styles.alignEnd}>
          <Text variant="tiny" color="textMuted">
            TOTAL DUE
          </Text>
          <Text variant="bodyStrong">{formatMoney(calc.totalRepayable)}</Text>
        </View>
      </View>
      <ProgressBar value={progress} style={styles.loanBar} />
      <Text variant="small" color="textSecondary">
        {formatPercent(progress, 0)} repaid · {formatMoney(calc.monthlyPayment)}/mo
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  alignEnd: { alignItems: 'flex-end' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.lg },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { color: 'rgba(255,255,255,0.8)', letterSpacing: 1 },
  heroValue: { color: '#fff', fontSize: 38, lineHeight: 44, fontWeight: '800', marginTop: 6 },
  heroShareRow: { flexDirection: 'row', gap: 8, marginTop: theme.spacing.md },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
  },
  heroPillText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  heroBarTrack: { height: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.22)', marginTop: theme.spacing.lg, overflow: 'hidden' },
  heroBarFill: { height: 8, borderRadius: 8, backgroundColor: '#fff' },
  heroCaption: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 8 },
  statRow: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.md },
  attentionCard: { marginTop: theme.spacing.md, gap: theme.spacing.md },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  attnIcon: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: theme.colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  voteList: { gap: theme.spacing.sm },
  voteItem: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceMuted, padding: theme.spacing.md, borderRadius: theme.radius.md,
  },
  adminTask: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceMuted, padding: theme.spacing.md, borderRadius: theme.radius.md,
  },
  cardTitle: { marginBottom: theme.spacing.md },
  donutWrap: { alignItems: 'center', paddingVertical: theme.spacing.sm },
  donutCenter: { alignItems: 'center' },
  divider: { marginVertical: theme.spacing.md },
  legend: { gap: theme.spacing.sm },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendPct: { width: 54, textAlign: 'right' },
  legendAmt: { width: 86, textAlign: 'right' },
  loanFigs: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.md },
  loanBar: { marginTop: theme.spacing.sm, marginBottom: 6 },
  actions: { gap: theme.spacing.md, marginTop: theme.spacing.lg },
});
