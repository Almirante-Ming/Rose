import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts';
import AuthNavigator from '@/components/AuthNavigator';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthNavigator />
    </AuthProvider>
  );
}
