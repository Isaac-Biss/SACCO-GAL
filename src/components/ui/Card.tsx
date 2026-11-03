import { ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { theme } from '@/constants/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  /** Tightens internal padding. */
  compact?: boolean;
  /** Removes the drop shadow (flat outlined card). */
  flat?: boolean;
  onPress?: () => void;
}

export function Card({ children, style, compact, flat, onPress }: CardProps) {
  const content = (
    <View
      style={[
        styles.card,
        compact && styles.compact,
        flat ? styles.flat : theme.shadow.card,
        style,
      ]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => (pressed ? styles.pressed : undefined)}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  compact: { padding: theme.spacing.md },
  flat: { borderColor: theme.colors.border },
  pressed: { opacity: 0.85, transform: [{ scale: 0.995 }] },
});
