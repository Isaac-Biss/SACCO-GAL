import { Stack } from 'expo-router';

export default function ContributionsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new" options={{ presentation: 'card' }} />
    </Stack>
  );
}
