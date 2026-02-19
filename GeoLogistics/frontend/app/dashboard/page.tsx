'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import api from '../lib/api';
import { LogOut, Package, Map as MapIcon, RotateCw, Settings, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Dynamically import Map with no SSR
// Dynamically import Map with no SSR
const Map = dynamic(() => import('../components/Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-zinc-100 flex items-center justify-center text-zinc-400">Carregando Mapa...</div>
});

export default function DashboardPage() {
    const [tenantName, setTenantName] = useState('');
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        statusCounts: {} as Record<string, number>
    });
    const [orders, setOrders] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedId = localStorage.getItem('tenant_id');
        if (!storedId) {
            router.push('/login');
            return;
        }
        setTenantName(localStorage.getItem('tenant_name') || 'Empresa');
        fetchData();
    }, [router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, driversRes, statsRes] = await Promise.all([
                api.get('/orders'),
                api.get('/drivers'),
                api.get('/orders/stats')
            ]);
            setOrders(ordersRes.data);
            setDrivers(driversRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
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
                        onClick={fetchData}
                        className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
                        title="Atualizar"
                    >
                        <RotateCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </header>

                {/* Content Grid */}
                {/* Stats Cards */}
                <div className="px-6 mb-6 mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
                        <h2 className="text-sm font-medium text-zinc-500 mb-2">Total de Pedidos</h2>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-zinc-900">{stats.totalOrders}</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
                        <h2 className="text-sm font-medium text-zinc-500 mb-2">Faturamento (Entregues)</h2>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-emerald-600">R$ {stats.totalRevenue.toFixed(2)}</span>
                        </div>
                    </div>
                    {/* Placeholder for more stats */}
                </div>

                {/* Content Grid */}
                <div className="flex-1 px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">

                    {/* Charts Column */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 h-[300px]">
                            <h3 className="text-sm font-semibold text-zinc-700 mb-4 flex items-center gap-2">
                                <PieIcon className="w-4 h-4" /> Distribuição por Status
                            </h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={Object.entries(stats.statusCounts).map(([name, value]) => ({ name, value }))}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#fbbf24" /> {/* PENDING */}
                                        <Cell fill="#3b82f6" /> {/* IN_TRANSIT */}
                                        <Cell fill="#10b981" /> {/* DELIVERED */}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 flex-1 overflow-y-auto">
                            <h3 className="text-sm font-semibold text-zinc-700 mb-4">Pedidos Recentes</h3>
                            <div className="space-y-2">
                                {orders.slice(0, 5).map(order => (
                                    <div key={order.id} className="flex justify-between items-center text-sm border-b border-zinc-50 py-2">
                                        <span className="text-zinc-600">#{order.id.slice(0, 6)}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Map View - Takes up 2 columns */}
                    <div className="lg:col-span-2 bg-zinc-200 rounded-xl overflow-hidden shadow-sm border border-zinc-300 relative flex flex-col">
                        <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-zinc-600 shadow-sm">
                            Mapa em Tempo Real ({drivers.length} entregadores)
                        </div>
                        <Map drivers={drivers} />
                    </div>
                </div>
            </main>
        </div>
    );
}
