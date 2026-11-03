import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/BrandMark';
import { Button, Card, Input, Screen, Text } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';
import { SETTINGS } from '@/data/mock';

export default function SignIn() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = () => {
    setError(null);
    if (!email.trim()) return setError('Enter your email address.');
    setLoading(true);
    const res = signIn(email, password);
    setLoading(false);
    if (!res.ok) return setError(res.error ?? 'Could not sign in.');
    router.replace('/(app)/dashboard');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen background="surface">
        <View style={styles.header}>
          <BrandMark size={64} />
          <Text variant="display" center style={styles.title}>
            {SETTINGS.groupName}
          </Text>
          <Text variant="body" color="textSecondary" center>
            Save together. Grow together.
          </Text>
        </View>

        <Card style={styles.card}>
          <Text variant="h2">Welcome back</Text>
          <Text variant="small" color="textSecondary" style={styles.sub}>
            Sign in to see your savings and the group fund.
          </Text>

          <View style={styles.form}>
            <Input
              label="Email address"
              icon="mail-outline"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Password"
              icon="lock-closed-outline"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={onSubmit}
            />
            {error ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={16} color={theme.colors.danger} />
                <Text variant="small" color="danger">
                  {error}
                </Text>
              </View>
            ) : null}
            <Button title="Sign in" icon="log-in-outline" loading={loading} onPress={onSubmit} />
          </View>
        </Card>

        <View style={styles.demoBox}>
          <Text variant="label" color="textSecondary" center>
            Prototype — try a demo account
          </Text>
          <Pressable onPress={() => setEmail('isaacssozi98@gmail.com')}>
            <Text variant="small" color="primary" center>
              isaacssozi98@gmail.com  ·  Admin
            </Text>
          </Pressable>
          <Pressable onPress={() => setEmail('grace.nakato@example.com')}>
            <Text variant="small" color="primary" center>
              grace.nakato@example.com  ·  Member
            </Text>
          </Pressable>
          <Text variant="tiny" color="textMuted" center>
            Any password works in the prototype.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text variant="small" color="textSecondary">
            New to the group?{' '}
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <Text variant="small" color="primary" style={styles.bold}>
                Create an account
              </Text>
            </Pressable>
          </Link>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.xl, marginBottom: theme.spacing.xl },
  title: { marginTop: theme.spacing.md },
  card: { gap: 0 },
  sub: { marginTop: 4, marginBottom: theme.spacing.lg },
  form: { gap: theme.spacing.md },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  demoBox: {
    marginTop: theme.spacing.lg,
    gap: 4,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySurface,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: theme.spacing.xl },
  bold: { fontWeight: '700' },
});
