import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

import { palette, theme } from '@/constants/theme';

/** A purple gradient hero card used for the headline figures. */
export function GradientCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <LinearGradient
      colors={[palette.purple500, palette.purple700, palette.purple900]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, theme.shadow.button, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
  },
});
