import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { theme, typography } from '@/constants/theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth = true,
  icon,
  iconRight,
  style,
}: ButtonProps) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { paddingVertical: s.py, paddingHorizontal: s.px, borderRadius: theme.radius.md },
        { backgroundColor: v.bg, borderColor: v.border, borderWidth: v.border ? 1.5 : 0 },
        variant === 'primary' && !isDisabled && theme.shadow.button,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={v.fg} />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={s.icon} color={v.fg} /> : null}
            <Text style={[{ color: v.fg, fontSize: s.font }, styles.label]}>{title}</Text>
            {iconRight ? <Ionicons name={iconRight} size={s.icon} color={v.fg} /> : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

const VARIANTS: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: theme.colors.primary, fg: theme.colors.textOnPrimary },
  secondary: { bg: theme.colors.primarySoft, fg: theme.colors.primaryDark },
  outline: { bg: 'transparent', fg: theme.colors.primary, border: theme.colors.borderStrong },
  ghost: { bg: 'transparent', fg: theme.colors.primary },
  danger: { bg: theme.colors.danger, fg: '#fff' },
};

const SIZES: Record<Size, { py: number; px: number; font: number; icon: number }> = {
  sm: { py: 8, px: 14, font: 14, icon: 16 },
  md: { py: 13, px: 18, font: 15, icon: 18 },
  lg: { py: 16, px: 22, font: 16, icon: 20 },
};

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: { fontWeight: typography.bodyStrong.fontWeight },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
});
