import { Redirect } from 'expo-router';

import { useAuth } from '@/auth/AuthContext';

/** Entry gate: send authenticated users to the app, everyone else to sign-in. */
export default function Index() {
  const { user } = useAuth();
  return <Redirect href={user ? '/(app)/dashboard' : '/(auth)/sign-in'} />;
}
