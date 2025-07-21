import { View, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/contexts';
import { useEffect } from 'react';
import { rose_theme } from '@constants/rose_theme';

export default function AuthNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            const navigateWithDelay = () => {
                try {
                    if (isAuthenticated) {
                        router.replace('/(tabs)/home');
                    } else {
                        router.replace('/login');
                    }
                } catch (error) {
                    console.error('Navigation error:', error);
                    setTimeout(() => {
                        if (isAuthenticated) {
                            router.replace('/(tabs)/home');
                        } else {
                            router.replace('/login');
                        }
                    }, 100);
                }
            };

            setTimeout(navigateWithDelay, 50);
        }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
                <ActivityIndicator size="large" color={rose_theme.rose_main} />
            </View>
        );
    }

    return (
        <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
        </Stack>
    );
}
