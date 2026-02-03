'use client';

import React, { useEffect, useState } from 'react';
import { useStoreAuth } from '@/app/context/StoreAuthContext';
import { useTheme } from '@/app/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { Package, Clock, CheckCircle, XCircle, ChevronRight, Info } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';

interface OrderItem {
    id: number;
    product: {
        name: string;
        image_url: string | null;
    };
    quantity: number;
    unit_price: number;
}

interface Order {
    id: number;
    total_amount: number;
    status: string;
    created_at: string;
    items: OrderItem[];
    payment_method: string;
}

export default function MyOrdersPage() {
    const { user, isLoading: authLoading } = useStoreAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/signin');
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else if (!authLoading && !user) {
            // If auth finished and no user, we redirect (above effect), but distinct loading logic here?
            // Actually if authLoading is false and user is null, we redirect. 
            // If authLoading is false and user is present, we fetch.
            // If authLoading is true, we wait.
        }
    }, [user, authLoading]);

    const fetchOrders = async () => {
        const token = Cookies.get('store_token');
        if (!token) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/my-orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();
            if (data.status === 'success') {
                setOrders(data.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
            case 'delivered':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle size={12} /> Pago</span>;
            case 'pending':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 flex items-center gap-1"><Clock size={12} /> Pendente</span>;
            case 'canceled':
            case 'failed':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1"><XCircle size={12} /> Cancelado</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen pt-24 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl text-pink-600 dark:text-pink-400">
                        <Package size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Meus Pedidos</h1>
                        <p className="text-slate-500 dark:text-slate-400">Acompanhe o histórico e status das suas compras</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                        <div className="bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package size={40} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Nenhum pedido encontrado</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                            Você ainda não realizou nenhuma compra. Explore nosso cardápio e faça seu primeiro pedido!
                        </p>
                        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-semibold transition-colors">
                            Ver Cardápio
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                                #{order.id.toString().padStart(4, '0')}
                                            </div>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                            <Clock size={16} />
                                            {new Date(order.created_at).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                    <span className="font-medium text-slate-900 dark:text-slate-100">{item.quantity}x</span>
                                                    <span>{item.product.name}</span>
                                                </div>
                                                <div className="text-slate-500 dark:text-slate-400">
                                                    R$ {Number(item.unit_price).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Total</span>
                                            <span className="text-xl font-bold text-pink-600 dark:text-pink-400">
                                                R$ {Number(order.total_amount).toFixed(2)}
                                            </span>
                                        </div>

                                        {/* Future: Add 'Details' button or 'Track' button */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
