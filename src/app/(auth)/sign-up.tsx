import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/BrandMark';
import { Button, Card, Input, Screen, Text } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = () => {
    setError(null);
    if (!fullName.trim()) return setError('Enter your full name.');
    if (!email.trim()) return setError('Enter your email address.');
    if (password.length < 4) return setError('Choose a password of at least 4 characters.');
    setLoading(true);
    const res = signUp({ fullName, email, phone, password });
    setLoading(false);
    if (!res.ok) return setError(res.error ?? 'Could not create your account.');
    router.replace('/(app)/dashboard');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen background="surface">
        <View style={styles.header}>
          <BrandMark size={56} />
          <Text variant="h1" center style={styles.title}>
            Join the SACCO
          </Text>
          <Text variant="small" color="textSecondary" center>
            Create your account to start contributing.
          </Text>
        </View>

        <Card>
          <View style={styles.form}>
            <Input
              label="Full name"
              icon="person-outline"
              placeholder="e.g. Grace Nakato"
              value={fullName}
              onChangeText={setFullName}
            />
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
              label="Phone number"
              icon="call-outline"
              placeholder="+256 ..."
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <Input
              label="Password"
              icon="lock-closed-outline"
              placeholder="Choose a password"
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
            <Button title="Create account" icon="person-add-outline" loading={loading} onPress={onSubmit} />
          </View>
        </Card>

        <View style={styles.footer}>
          <Text variant="small" color="textSecondary">
            Already a member?{' '}
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text variant="small" color="primary" style={styles.bold}>
                Sign in
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
  header: { alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.xl, marginBottom: theme.spacing.lg },
  title: { marginTop: theme.spacing.sm },
  form: { gap: theme.spacing.md },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: theme.spacing.xl },
  bold: { fontWeight: '700' },
});
