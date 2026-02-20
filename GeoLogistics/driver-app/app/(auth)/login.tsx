import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Truck } from 'lucide-react-native';
// import { api } from '../../lib/api'; // We will create this next

export default function Login() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleLogin = async () => {
        if (!phone || !password) {
            Alert.alert('Erro', 'Preencha o telefone e a senha.');
            return;
        }

        setLoading(true);
        try {
            // Fake implementation for now, will connect to api later
            // const response = await api.post('/auth/driver/login', { phone, password });

            // MOCK DATA for layout testing
            const mockDriver = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                tenant_id: 'tenant-123',
                name: 'Motoboy Teste',
                phone: phone,
                vehicle_type: 'MOTORCYCLE',
                status: 'OFFLINE',
                is_active: true
            };

            await setAuth(mockDriver, 'mock-jwt-token');
            router.replace('/(main)/dashboard');
        } catch (error: any) {
            Alert.alert('Erro no Login', error.response?.data?.message || 'Credenciais inválidas ou erro no servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Truck size={48} color="#fff" />
                    </View>
                    <Text style={styles.title}>GeoLogistics</Text>
                    <Text style={styles.subtitle}>App do Entregador</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Telefone</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="(11) 99999-9999"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Senha (Para testes da API, não implementada ainda no backend)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Sua senha"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#0f172a',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 4,
    },
    formContainer: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    input: {
        height: 52, // 48dp minimum for touch target
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#0f172a',
        marginBottom: 20,
    },
    button: {
        height: 56, // Large touch target for thumb zone
        backgroundColor: '#0f172a',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: '#94a3b8',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
