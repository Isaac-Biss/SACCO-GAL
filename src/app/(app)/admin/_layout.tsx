import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/auth/AuthContext';

export default function AdminLayout() {
  const { isAdmin } = useAuth();
  // Admin tools are only for admins; members get bounced to their dashboard.
  if (!isAdmin) return <Redirect href="/(app)/dashboard" />;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
