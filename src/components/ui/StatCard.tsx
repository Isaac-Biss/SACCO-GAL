import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { theme } from '@/constants/theme';
import { Card } from './Card';
import { Text } from './Text';

interface StatCardProps {
  label: string;
  value: string;
  caption?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'default' | 'primary';
  style?: ViewStyle;
}

/** Small KPI card for dashboards. */
export function StatCard({ label, value, caption, icon, tone = 'default', style }: StatCardProps) {
  const primary = tone === 'primary';
  return (
    <Card compact style={StyleSheet.flatten([styles.card, style])}>
      <View style={styles.head}>
        <Text variant="label" color="textSecondary">
          {label}
        </Text>
        {icon ? (
          <View style={[styles.iconWrap, primary && { backgroundColor: theme.colors.primarySoft }]}>
            <Ionicons name={icon} size={14} color={theme.colors.primary} />
          </View>
        ) : null}
      </View>
      <Text variant="h2" style={styles.value} color={primary ? 'primary' : 'text'}>
        {value}
      </Text>
      {caption ? (
        <Text variant="small" color="textMuted">
          {caption}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: 2 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { marginTop: 4 },
});
