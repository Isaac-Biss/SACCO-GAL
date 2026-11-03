import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';

/** The SACCO logo mark — a rounded purple tile with a savings glyph. */
export function BrandMark({ size = 56 }: { size?: number }) {
  return (
    <View
      style={[
        styles.mark,
        { width: size, height: size, borderRadius: size * 0.3 },
        theme.shadow.button,
      ]}>
      <Ionicons name="people" size={size * 0.52} color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
