import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';
import { Text } from './Text';

interface Segment<T extends string> {
  value: T;
  label: string;
  badge?: number;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.wrap}>
      {segments.map((seg) => {
        const active = seg.value === value;
        return (
          <Pressable
            key={seg.value}
            onPress={() => onChange(seg.value)}
            style={[styles.segment, active && styles.active]}>
            <Text
              variant="label"
              color={active ? 'primary' : 'textSecondary'}
              numberOfLines={1}>
              {seg.label}
              {seg.badge ? ` (${seg.badge})` : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSunken,
    borderRadius: theme.radius.md,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: theme.radius.sm,
  },
  active: {
    backgroundColor: theme.colors.surface,
    ...(theme.shadow.card as object),
  },
});
