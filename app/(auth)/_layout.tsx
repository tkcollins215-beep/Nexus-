import { useAuth } from '@/context/AuthContext';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { state } = useAuth();

  if (state.isLoading) {
    // Show loading screen while checking auth status
    return null;
  }

  if (state.user && state.token) {
    // User is logged in, redirect to main app
    return <Redirect href="/(app)/conversations" />;
  }

  // User not logged in, show auth screens
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
