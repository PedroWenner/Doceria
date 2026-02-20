import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Navigation, Package, MapPin, CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';

const { width } = Dimensions.get('window');

type OrderStatus = 'PENDING' | 'ACCEPTED' | 'EN_ROUTE_TO_STORE' | 'EN_ROUTE_TO_CUSTOMER' | 'DELIVERED';

export default function OrderDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // Mock Active Order State
    const [status, setStatus] = useState<OrderStatus>('PENDING');
    const [loading, setLoading] = useState(false);

    // Mock Data
    const order = {
        id: Array.isArray(id) ? id[0] : id,
        pickup_address: 'Doceria - Endereço Principal, 100',
        dropoff_address: 'Rua do Cliente, 400',
        price: 15.50,
        distance_km: 3.2,
        pickup_lat: -23.5505,
        pickup_lon: -46.6333,
        dropoff_lat: -23.5615,
        dropoff_lon: -46.6550,
    };

    const updateStatus = async (newStatus: OrderStatus) => {
        setLoading(true);
        try {
            // api.patch(`/orders/${order.id}/status`, { status: newStatus })
            setTimeout(() => {
                setStatus(newStatus);
                setLoading(false);
                if (newStatus === 'DELIVERED') {
                    Alert.alert('Sucesso', 'Entrega finalizada!', [
                        { text: 'OK', onPress: () => router.back() }
                    ]);
                }
            }, 800);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const renderActionButtons = () => {
        if (loading) {
            return (
                <View style={[styles.actionButton, styles.buttonDisabled]}>
                    <Text style={styles.actionButtonText}>Atualizando...</Text>
                </View>
            );
        }

        switch (status) {
            case 'PENDING':
                return (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.buttonAccept]}
                        onPress={() => updateStatus('ACCEPTED')}
                    >
                        <CheckCircle2 size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>Aceitar Corrida</Text>
                    </TouchableOpacity>
                );
            case 'ACCEPTED':
                return (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.buttonRoute]}
                        onPress={() => updateStatus('EN_ROUTE_TO_STORE')}
                    >
                        <Navigation size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>A caminho da Loja</Text>
                    </TouchableOpacity>
                );
            case 'EN_ROUTE_TO_STORE':
                return (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.buttonRoute]}
                        onPress={() => updateStatus('EN_ROUTE_TO_CUSTOMER')}
                    >
                        <Package size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>Pacote Coletado</Text>
                    </TouchableOpacity>
                );
            case 'EN_ROUTE_TO_CUSTOMER':
                return (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.buttonDeliver]}
                        onPress={() => updateStatus('DELIVERED')}
                    >
                        <MapPin size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>Entregue ao Cliente</Text>
                    </TouchableOpacity>
                );
            default:
                return null;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'PENDING': return 'NÃO ACEITA';
            case 'ACCEPTED': return 'AGUARDANDO DESLOCAMENTO';
            case 'EN_ROUTE_TO_STORE': return 'INDO PARA A LOJA';
            case 'EN_ROUTE_TO_CUSTOMER': return 'INDO PARA O CLIENTE';
            case 'DELIVERED': return 'FINALIZADA';
            default: return 'DESCONHECIDO';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                    <ArrowLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pedido #{order.id?.split('-')[1] || '123'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: (order.pickup_lat + order.dropoff_lat) / 2,
                            longitude: (order.pickup_lon + order.dropoff_lon) / 2,
                            latitudeDelta: Math.abs(order.pickup_lat - order.dropoff_lat) * 2 + 0.01,
                            longitudeDelta: Math.abs(order.pickup_lon - order.dropoff_lon) * 2 + 0.01,
                        }}
                    >
                        <Marker
                            coordinate={{ latitude: order.pickup_lat, longitude: order.pickup_lon }}
                            title="Loja (Coleta)"
                            pinColor="blue"
                        />
                        <Marker
                            coordinate={{ latitude: order.dropoff_lat, longitude: order.dropoff_lon }}
                            title="Cliente (Entrega)"
                            pinColor="red"
                        />
                        {/* Real implementation would use Mapbox Directions API or Google Directions to draw polyline */}
                        <Polyline
                            coordinates={[
                                { latitude: order.pickup_lat, longitude: order.pickup_lon },
                                { latitude: order.dropoff_lat, longitude: order.dropoff_lon },
                            ]}
                            strokeColor="#0f172a"
                            strokeWidth={3}
                            lineDashPattern={[5, 5]}
                        />
                    </MapView>
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>{getStatusText()}</Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Valor a receber</Text>
                        <Text style={styles.priceValue}>R$ {order.price.toFixed(2)}</Text>
                    </View>

                    <View style={styles.addressBlock}>
                        <View style={styles.addressHeader}>
                            <Package size={20} color="#0f172a" />
                            <Text style={styles.addressTitle}>Local de Coleta</Text>
                        </View>
                        <Text style={styles.addressValue}>{order.pickup_address}</Text>
                    </View>

                    <View style={styles.addressBlock}>
                        <View style={styles.addressHeader}>
                            <MapPin size={20} color="#ef4444" />
                            <Text style={styles.addressTitle}>Local de Entrega</Text>
                        </View>
                        <Text style={styles.addressValue}>{order.dropoff_address}</Text>
                    </View>

                    <View style={styles.distanceBlock}>
                        <Text style={styles.distanceTitle}>Distância Total</Text>
                        <Text style={styles.distanceValue}>{order.distance_km} km</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                {renderActionButtons()}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    mapContainer: {
        width: '100%',
        height: width * 0.6,
        backgroundColor: '#e2e8f0',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    infoContainer: {
        padding: 20,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 20,
    },
    statusBadgeText: {
        color: '#3b82f6',
        fontWeight: 'bold',
        fontSize: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        marginBottom: 20,
    },
    priceLabel: {
        fontSize: 16,
        color: '#64748b',
    },
    priceValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#10b981',
    },
    addressBlock: {
        marginBottom: 24,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    addressTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        marginLeft: 8,
    },
    addressValue: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 22,
        paddingLeft: 28,
    },
    distanceBlock: {
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    distanceTitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 4,
    },
    distanceValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 0 : 20,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    actionButton: {
        flexDirection: 'row',
        height: 64, // Large thumb-friendly area
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    buttonAccept: {
        backgroundColor: '#10b981', // Verde = aceitar
    },
    buttonRoute: {
        backgroundColor: '#3b82f6', // Azul = em rota
    },
    buttonDeliver: {
        backgroundColor: '#0f172a', // Preto = finalizar
    },
    buttonDisabled: {
        backgroundColor: '#94a3b8',
        elevation: 0,
        shadowOpacity: 0,
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 12,
    },
});
