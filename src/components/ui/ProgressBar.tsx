import { StyleSheet, View, ViewStyle } from 'react-native';

import { theme } from '@/constants/theme';

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  color?: string;
  track?: string;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({
  value,
  color = theme.colors.primary,
  track = theme.colors.surfaceSunken,
  height = 8,
  style,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value || 0)) * 100;
  return (
    <View style={[styles.track, { backgroundColor: track, height, borderRadius: height }, style]}>
      <View style={{ width: `${pct}%`, backgroundColor: color, height, borderRadius: height }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
});
