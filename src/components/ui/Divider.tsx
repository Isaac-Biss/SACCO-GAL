import { StyleSheet, View, ViewStyle } from 'react-native';

import { theme } from '@/constants/theme';

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
    width: '100%',
  },
});
