import { StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';
import { Text } from './Text';

interface AvatarProps {
  name: string;
  color?: string;
  size?: number;
  /** Shows a small ring, e.g. to mark the current user. */
  ring?: boolean;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, color = theme.colors.primary, size = 40, ring }: AvatarProps) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        ring && { borderWidth: 2, borderColor: theme.colors.primary },
      ]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontWeight: '700' },
});
