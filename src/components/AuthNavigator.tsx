import { View, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/contexts';
import { useEffect } from 'react';
import { rose_theme } from '@constants/rose_theme';

export default function AuthNavigator() {
    const { isAuthenticated, isLoading, user } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            const navigateWithDelay = () => {
                try {
                    if (isAuthenticated && user?.role) {
                        // Redirect based on access level
                        const accLevel = user.role.level;
                        
                        if (accLevel === 2) {
                            // Admin - access to all routes
                            router.replace('/(admin)/home');
                        } else if (accLevel === 1) {
                            // Trainer - access to home and new_schedule
                            router.replace('/(trainer)/home');
                        } else {
                            // Customer (acc_level 0) - access only to home
                            router.replace('/(user)/home');
                        }
                    } else {
                        router.replace('/login');
                    }
                } catch (error) {
                    console.error('Navigation error:', error);
                    setTimeout(() => {
                        if (isAuthenticated && user?.role) {
                            const accLevel = user.role.level;
                            
                            if (accLevel === 2) {
                                router.replace('/(admin)/home');
                            } else if (accLevel === 1) {
                                router.replace('/(trainer)/home');
                            } else {
                                router.replace('/(user)/home');
                            }
                        } else {
                            router.replace('/login');
                        }
                    }, 100);
                }
            };

            setTimeout(navigateWithDelay, 50);
        }
    }, [isAuthenticated, isLoading, user]);

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
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="(trainer)" options={{ headerShown: false }} />
            <Stack.Screen name="(user)" options={{ headerShown: false }} />
            <Stack.Screen name="personAdd" options={{ headerShown: false }} />
            <Stack.Screen name="machine_add" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
        </Stack>
    );
}
