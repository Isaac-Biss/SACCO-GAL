import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { theme } from '@/constants/theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Shows a back chevron on the left. */
  back?: boolean;
  /** Element shown on the right (avatar, action button). */
  right?: ReactNode;
}

export function PageHeader({ title, subtitle, back, right }: PageHeaderProps) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      {back ? (
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(app)/dashboard'))}
          style={styles.backBtn}
          hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </Pressable>
      ) : null}
      <View style={styles.flex}>
        {subtitle ? (
          <Text variant="label" color="textSecondary">
            {subtitle}
          </Text>
        ) : null}
        <Text variant="h1">{title}</Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1, gap: 2 },
});
