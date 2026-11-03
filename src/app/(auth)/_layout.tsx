import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/auth/AuthContext';

export default function AuthLayout() {
  const { user } = useAuth();
  if (user) return <Redirect href="/(app)/dashboard" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
