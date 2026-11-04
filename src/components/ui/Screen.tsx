import { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  RefreshControlProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, theme } from '@/constants/theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  /** Extra element pinned to the bottom (e.g. a primary action button). */
  footer?: ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentStyle?: ViewStyle;
  background?: 'surface' | 'muted';
}

/**
 * Page shell: safe-area aware, centres content to a comfortable max width on
 * wide (web/tablet) screens, and optionally scrolls.
 */
export function Screen({
  children,
  scroll = true,
  padded = true,
  footer,
  refreshControl,
  contentStyle,
  background = 'muted',
}: ScreenProps) {
  const bg = background === 'muted' ? theme.colors.surfaceMuted : theme.colors.surface;
  const inner = (
    <View style={[styles.inner, padded && styles.padded, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always">
          {inner}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.scrollContent]}>{inner}</View>
      )}
      {footer ? (
        <View style={[styles.footer, { backgroundColor: bg }]}>
          <View style={styles.footerInner}>{footer}</View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { alignItems: 'center', flexGrow: 1 },
  inner: { width: '100%', maxWidth: MaxContentWidth },
  padded: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  footerInner: { width: '100%', maxWidth: MaxContentWidth },
});
