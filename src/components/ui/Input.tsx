import { Ionicons } from '@expo/vector-icons';
import { forwardRef, ReactNode, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { theme, typography } from '@/constants/theme';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Element rendered at the left (e.g. a currency symbol). */
  prefix?: ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, hint, error, icon, prefix, style, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="label" color="textSecondary" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          focused && styles.focused,
          !!error && styles.errored,
        ]}>
        {icon ? (
          <Ionicons name={icon} size={18} color={theme.colors.textMuted} style={styles.icon} />
        ) : null}
        {prefix}
        <TextInput
          ref={ref}
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </View>
      {error ? (
        <Text variant="small" color="danger" style={styles.helper}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="small" color="textMuted" style={styles.helper}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { marginLeft: 2 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    minHeight: 50,
  },
  focused: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySurface },
  errored: { borderColor: theme.colors.danger },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: theme.colors.text,
    paddingVertical: 12,
    // remove the focus outline on web
    outlineStyle: 'none' as any,
  },
  helper: { marginLeft: 2 },
});
