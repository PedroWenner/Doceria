import { Redirect } from 'expo-router';

export default function Index() {
    // We will check authentication later. For now, redirect to login.
    return <Redirect href="/(auth)/login" />;
}
