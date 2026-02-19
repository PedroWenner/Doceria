'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import api from '../lib/api';
import { LogOut, Package, Map as MapIcon, RotateCw, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Dynamically import Map with no SSR
const Map = dynamic(() => import('../../components/dashboard/Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-zinc-100 flex items-center justify-center text-zinc-400">Carregando Mapa...</div>
});

export default function DashboardPage() {
    const [tenantName, setTenantName] = useState('');
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check auth
        const storedTenant = localStorage.getItem('tenant_name');
        const storedId = localStorage.getItem('tenant_id');

        if (!storedId) {
            router.push('/login');
            return;
        }

        setTenantName(storedTenant || 'Empresa');
        fetchOrders();
    }, [router]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-zinc-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col">
                <div className="p-6 border-b border-zinc-100">
                    <h1 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                        <MapIcon className="w-6 h-6" />
                        GeoLogistics
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">Painel: {tenantName}</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
                        <Package className="w-5 h-5" />
                        Pedidos
                    </a>
                    <a href="/settings" className="flex items-center gap-3 px-4 py-3 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg font-medium transition-colors">
                        <Settings className="w-5 h-5" />
                        Configurações
                    </a>
                </nav>

                <div className="p-4 border-t border-zinc-100">
                    <button
                        onClick={() => {
                            localStorage.clear();
                            router.push('/login');
                        }}
                        className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors w-full px-4 py-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6">
                    <h2 className="font-semibold text-zinc-700">Monitoramento em Tempo Real</h2>
                    <button
                        onClick={fetchOrders}
                        className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
                        title="Atualizar"
                    >
                        <RotateCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </header>

                {/* Content Grid */}
                <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                    {/* Orders List */}
                    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-zinc-100 font-medium text-zinc-700 flex justify-between">
                            <h3>Lista de Pedidos</h3>
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{orders.length} ativo(s)</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {orders.map(order => (
                                <div key={order.id} className="p-3 rounded-lg border border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-mono text-zinc-400">#{order.id.slice(0, 8)}</span>
                                        <span className="text-xs font-bold text-emerald-600">R$ {order.price}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <p className="text-sm text-zinc-600 truncate" title={order.pickup_address || 'Origem'}>
                                                {order.pickup_address || `Lat: ${order.pickup_lat.toFixed(4)}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <p className="text-sm text-zinc-600 truncate" title={order.dropoff_address || 'Destino'}>
                                                {order.dropoff_address || `Lat: ${order.dropoff_lat.toFixed(4)}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {orders.length === 0 && !loading && (
                                <div className="p-8 text-center text-zinc-400">
                                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Nenhum pedido encontrado.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Map View */}
                    <div className="lg:col-span-2 bg-zinc-200 rounded-xl overflow-hidden shadow-sm border border-zinc-300 relative">
                        <Map
                            center={[-23.550520, -46.633309]} // SP Center fallback
                            orders={orders}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
