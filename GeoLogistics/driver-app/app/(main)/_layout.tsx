import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';

export default function MainLayout() {
    const { token, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !token) {
            router.replace('/(auth)/login');
        }
    }, [token, isLoading]);

    if (isLoading) {
        return null; // Or a splash screen
    }

    return (
        <Stack>
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="order/[id]" options={{ headerShown: false }} />
        </Stack>
    );
}
