import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { theme } from '@/constants/theme';
import { Text } from './Text';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

const TONES: Record<BadgeTone, { bg: string; fg: string }> = {
  neutral: { bg: theme.colors.surfaceSunken, fg: theme.colors.textSecondary },
  primary: { bg: theme.colors.primarySoft, fg: theme.colors.primaryDark },
  success: { bg: theme.colors.successBg, fg: theme.colors.success },
  warning: { bg: theme.colors.warningBg, fg: theme.colors.warning },
  danger: { bg: theme.colors.dangerBg, fg: theme.colors.danger },
  info: { bg: theme.colors.infoBg, fg: theme.colors.info },
};

export function Badge({ label, tone = 'neutral', icon, style }: BadgeProps) {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }, style]}>
      {icon ? <Ionicons name={icon} size={12} color={t.fg} /> : null}
      <Text variant="tiny" style={{ color: t.fg, textTransform: 'uppercase' }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
});
