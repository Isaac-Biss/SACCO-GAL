import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

import { theme, typography } from '@/constants/theme';

type Variant = keyof typeof typography;
type ColorKey = 'text' | 'textSecondary' | 'textMuted' | 'primary' | 'textOnPrimary' | 'danger' | 'success' | 'warning';

export interface TextProps extends RNTextProps {
  variant?: Variant;
  color?: ColorKey;
  center?: boolean;
}

/** Themed text. `variant` picks the type scale, `color` a semantic colour. */
export function Text({ variant = 'body', color = 'text', center, style, ...rest }: TextProps) {
  return (
    <RNText
      style={[
        typography[variant],
        { color: theme.colors[color] },
        center && styles.center,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});
