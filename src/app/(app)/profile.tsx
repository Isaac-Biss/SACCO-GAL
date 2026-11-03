import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/PageHeader';
import { Avatar, Badge, Button, Card, Divider, Screen, Text } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';
import { useData } from '@/data/store';
import { formatDate } from '@/lib/date';
import { formatMoney, formatPercent } from '@/lib/money';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAdmin, signOut, switchUser } = useAuth();
  const d = useData();
  if (!user) return null;

  const savings = d.memberSavings(user.id);
  const share = d.memberPercent(user.id);

  return (
    <Screen>
      <PageHeader title="Profile" />

      {/* Identity */}
      <Card style={styles.card}>
        <View style={styles.identity}>
          <Avatar name={user.fullName} color={user.avatarColor} size={60} />
          <View style={styles.flex}>
            <View style={styles.nameRow}>
              <Text variant="h2" numberOfLines={1}>
                {user.fullName}
              </Text>
              {isAdmin ? <Badge label="Admin" tone="primary" icon="shield-checkmark" /> : null}
            </View>
            <Text variant="small" color="textSecondary">
              Member since {formatDate(user.joinedAt)}
            </Text>
          </View>
        </View>
        <Divider style={styles.divider} />
        <InfoRow icon="mail-outline" label="Email" value={user.email} />
        <InfoRow icon="call-outline" label="Phone" value={user.phone || '—'} />
        <Divider style={styles.divider} />
        <View style={styles.savingsRow}>
          <View>
            <Text variant="label" color="textSecondary">
              YOUR SAVINGS
            </Text>
            <Text variant="h3" color="primary">
              {formatMoney(savings)}
            </Text>
          </View>
          <View style={styles.alignEnd}>
            <Text variant="label" color="textSecondary">
              FUND SHARE
            </Text>
            <Text variant="h3">{formatPercent(share)}</Text>
          </View>
        </View>
      </Card>

      {/* Admin tools */}
      {isAdmin ? (
        <View style={styles.section}>
          <Text variant="label" color="textSecondary" style={styles.sectionLabel}>
            ADMIN TOOLS
          </Text>
          <Card compact style={styles.menu}>
            <MenuRow icon="receipt-outline" label="Verify deposits" badge={d.pendingContributions().length} onPress={() => router.push('/(app)/admin/verify')} />
            <Divider />
            <MenuRow icon="cash-outline" label="Manage loans" badge={d.loansForReview().length} onPress={() => router.push('/(app)/admin')} />
            <Divider />
            <MenuRow icon="settings-outline" label="Group settings" onPress={() => router.push('/(app)/admin/settings')} />
          </Card>
        </View>
      ) : null}

      {/* Demo: switch user */}
      <View style={styles.section}>
        <Text variant="label" color="textSecondary" style={styles.sectionLabel}>
          PROTOTYPE · VIEW AS ANOTHER MEMBER
        </Text>
        <Card compact>
          <Text variant="small" color="textMuted" style={styles.switchHint}>
            Tap a member to see the app from their side (admin verification, loan voting, etc.).
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switchRow}>
            {d.members.map((m) => {
              const active = m.id === user.id;
              return (
                <Pressable key={m.id} style={styles.switchItem} onPress={() => switchUser(m.id)}>
                  <Avatar name={m.fullName} color={m.avatarColor} size={46} ring={active} />
                  <Text variant="tiny" color={active ? 'primary' : 'textSecondary'} numberOfLines={1} style={styles.switchName}>
                    {m.fullName.split(' ')[0]}
                  </Text>
                  {m.role === 'admin' ? (
                    <Text variant="tiny" color="textMuted">
                      admin
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Card>
      </View>

      <Button title="Sign out" variant="outline" icon="log-out-outline" onPress={signOut} style={styles.signOut} />

      <Text variant="tiny" color="textMuted" center style={styles.version}>
        {d.settings.groupName} · prototype build
      </Text>
    </Screen>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={theme.colors.textMuted} />
      <Text variant="small" color="textSecondary" style={styles.infoLabel}>
        {label}
      </Text>
      <Text variant="small" style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <Text variant="body" style={styles.flex}>
        {label}
      </Text>
      {badge ? <Badge label={String(badge)} tone="primary" /> : null}
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  alignEnd: { alignItems: 'flex-end' },
  card: { marginBottom: theme.spacing.lg },
  identity: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  divider: { marginVertical: theme.spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: 6 },
  infoLabel: { width: 54 },
  infoValue: { flex: 1, textAlign: 'right' },
  savingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  section: { marginBottom: theme.spacing.lg },
  sectionLabel: { marginBottom: theme.spacing.sm },
  menu: { paddingVertical: 0 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.md },
  menuIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  switchHint: { marginBottom: theme.spacing.md },
  switchRow: { gap: theme.spacing.lg, paddingVertical: theme.spacing.xs, paddingRight: theme.spacing.md },
  switchItem: { alignItems: 'center', gap: 4, width: 60 },
  switchName: { textAlign: 'center' },
  signOut: { marginTop: theme.spacing.sm },
  version: { marginTop: theme.spacing.lg },
});
