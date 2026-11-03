import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';
import { Text } from './Text';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.circle}>
        <Ionicons name={icon} size={28} color={theme.colors.primary} />
      </View>
      <Text variant="h3" center>
        {title}
      </Text>
      {message ? (
        <Text variant="small" color="textSecondary" center style={styles.msg}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: theme.spacing.xxl, gap: theme.spacing.sm },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  msg: { maxWidth: 280 },
});
