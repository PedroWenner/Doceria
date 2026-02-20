import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { LogOut, MapPin, Navigation, Package } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

// Mock types
interface Order {
    id: string;
    status: string;
    pickup_address: string;
    dropoff_address: string;
    price: number;
    distance_km: number;
    tenant_id: string;
}

export default function Dashboard() {
    const { driver, logout } = useAuthStore();
    const router = useRouter();
    const [isOnline, setIsOnline] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    // Example of fetching active orders
    const fetchOrders = useCallback(async () => {
        if (!isOnline) {
            setOrders([]);
            return;
        }
        setLoading(true);
        try {
            // Mock fetch
            setTimeout(() => {
                setOrders([
                    {
                        id: 'ord-1234',
                        status: 'PENDING',
                        pickup_address: 'Doceria - Endereço Principal, 100',
                        dropoff_address: 'Rua do Cliente, 400',
                        price: 15.50,
                        distance_km: 3.2,
                        tenant_id: 'tenant-123'
                    },
                    {
                        id: 'ord-9876',
                        status: 'PENDING',
                        pickup_address: 'Doceria - Endereço Secundário, 200',
                        dropoff_address: 'Avenida Brasil, 1500',
                        price: 25.00,
                        distance_km: 6.8,
                        tenant_id: 'tenant-123'
                    }
                ]);
                setLoading(false);
            }, 1000);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    }, [isOnline]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const toggleStatus = async () => {
        if (!isOnline) {
            // Request location permissions when going online
            const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
            if (fgStatus !== 'granted') {
                Alert.alert('Erro', 'Precisamos da permissão de localização (durante o uso) para receber corridas.');
                return;
            }
            const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
            if (bgStatus !== 'granted') {
                Alert.alert('Aviso', 'Para rastrear a corrida offline, precisamos da permissão O Tempo Todo.');
            }

            try {
                await Location.startLocationUpdatesAsync('background-location-task', {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 50,
                    timeInterval: 10000,
                    deferredUpdatesInterval: 10000,
                    showsBackgroundLocationIndicator: true,
                    foregroundService: {
                        notificationTitle: 'GeoLogistics',
                        notificationBody: 'Rastreando localização da entrega',
                        notificationColor: '#10b981',
                    }
                });
                setIsOnline(true);
            } catch (err) {
                console.error(err);
                Alert.alert('Erro', 'Não foi possível iniciar o rastreamento.');
            }
        } else {
            try {
                if (await Location.hasStartedLocationUpdatesAsync('background-location-task')) {
                    await Location.stopLocationUpdatesAsync('background-location-task');
                }
            } catch (err) {
                console.error(err);
            }
            setIsOnline(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Sair', 'Tem certeza que deseja sair?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair', style: 'destructive', onPress: async () => {
                    await logout();
                    router.replace('/(auth)/login');
                }
            }
        ]);
    };

    const MemoizedOrderItem = React.memo(({ item }: { item: Order }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => router.push(`/(main)/order/${item.id}`)}
        >
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Corrida #{item.id.split('-')[1]}</Text>
                <Text style={styles.orderPrice}>R$ {item.price.toFixed(2)}</Text>
            </View>

            <View style={styles.addressRow}>
                <Package size={16} color="#0f172a" />
                <Text style={styles.addressText} numberOfLines={1}>Coleta: {item.pickup_address}</Text>
            </View>

            <View style={styles.addressRow}>
                <MapPin size={16} color="#ef4444" />
                <Text style={styles.addressText} numberOfLines={1}>Entrega: {item.dropoff_address}</Text>
            </View>

            <View style={styles.orderFooter}>
                <View style={styles.distanceBadge}>
                    <Navigation size={14} color="#64748b" />
                    <Text style={styles.distanceText}>{item.distance_km} km</Text>
                </View>
                <Text style={styles.acceptText}>Tocar para ver detalhes</Text>
            </View>
        </TouchableOpacity>
    ));

    const renderItem = useCallback(({ item }: { item: Order }) => <MemoizedOrderItem item={item} />, []);
    const keyExtractor = useCallback((item: Order) => item.id, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Olá, {driver?.name?.split(' ')[0]}</Text>
                    <Text style={styles.subGreeting}>{driver?.vehicle_type === 'MOTORCYCLE' ? '🏍️ Moto' : '🚗 Carro'} • {driver?.tenant_id}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <LogOut size={24} color="#64748b" />
                </TouchableOpacity>
            </View>

            <View style={styles.statusContainer}>
                <TouchableOpacity
                    style={[styles.statusToggle, isOnline ? styles.statusOnline : styles.statusOffline]}
                    onPress={toggleStatus}
                >
                    <View style={styles.statusIndicatorContainer}>
                        <View style={[styles.statusDot, isOnline ? { backgroundColor: '#fff' } : { backgroundColor: '#94a3b8' }]} />
                        <Text style={[styles.statusText, isOnline ? { color: '#fff' } : { color: '#64748b' }]}>
                            {isOnline ? 'VOCÊ ESTÁ ONLINE' : 'VOCÊ ESTÁ OFFLINE'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.feedContainer}>
                <Text style={styles.feedTitle}>Disponíveis agora</Text>

                {!isOnline ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>Fique online para receber pedidos</Text>
                    </View>
                ) : loading ? (
                    <ActivityIndicator size="large" color="#0f172a" style={{ marginTop: 40 }} />
                ) : orders.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>Procurando corridas perto de você...</Text>
                        <ActivityIndicator size="small" color="#64748b" style={{ marginTop: 16 }} />
                    </View>
                ) : (
                    <FlatList
                        data={orders}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    subGreeting: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    logoutBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
    },
    statusContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    statusToggle: {
        height: 64, // Very large touch area (thumb zone friendly)
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    statusOffline: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    statusOnline: {
        backgroundColor: '#10b981', // Emerald green
    },
    statusIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    feedContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    feedTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 16,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 60,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        maxWidth: 200,
    },
    listContent: {
        paddingBottom: 40,
    },
    orderCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    orderPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#10b981',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    addressText: {
        fontSize: 14,
        color: '#334155',
        marginLeft: 8,
        flex: 1,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    distanceText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
        marginLeft: 4,
    },
    acceptText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0f172a',
    }
});
