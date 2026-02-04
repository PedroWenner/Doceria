'use client';

import React, { useEffect, useState } from 'react';
import { useStoreAuth } from '@/app/context/StoreAuthContext';
import { useTheme } from '@/app/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { Package, Clock, CheckCircle, XCircle, ChevronRight, Info } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/app/context/LanguageContext';

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
    payment_status: string;
    created_at: string;
    items: OrderItem[];
    payment_method: string;
    payment_metadata?: {
        transaction_id?: number;
        qr_code?: string;
        qr_code_base64?: string;
        ticket_url?: string;
        transaction_data?: {
            qr_code?: string;
            qr_code_base64?: string;
            ticket_url?: string;
            ticket_url_base64?: string;
        };
    };
}

export default function MyOrdersPage() {
    const { user, isLoading: authLoading } = useStoreAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPixOrder, setSelectedPixOrder] = useState<Order | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/signin');
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else if (!authLoading && !user) {
            // No action needed, router will push
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
                console.log('Orders Data:', data.data);
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
            case 'preparing':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700 flex items-center gap-1 border border-sky-200">👨‍🍳 {t(`orders.${status}`) || status}</span>;
            case 'ready':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1 border border-emerald-200">✨ {t(`orders.${status}`) || status}</span>;
            case 'delivered':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200">🏁 {t(`orders.${status}`) || status}</span>;
            case 'canceled':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 flex items-center gap-1 border border-rose-200">❌ {t(`orders.${status}`) || status}</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 flex items-center gap-1 border border-amber-200">⏳ {t(`orders.${status}`) || status}</span>;
        }
    };

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">💰 {t(`orders.payment_status.${status}`) || status}</span>;
            case 'failed':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-wide">⚠️ {t(`orders.payment_status.${status}`) || status}</span>;
            case 'refunded':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wide">↩️ {t(`orders.payment_status.${status}`) || status}</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200 uppercase tracking-wide">🕒 {t(`orders.payment_status.${status}`) || status}</span>;
        }
    };

    const handleCopyPix = () => {
        const qrCode = selectedPixOrder?.payment_metadata?.qr_code || selectedPixOrder?.payment_metadata?.transaction_data?.qr_code;
        if (qrCode) {
            navigator.clipboard.writeText(qrCode);
            toast.success("Código Pix copiado!");
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
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('orders.title')}</h1>
                        <p className="text-slate-500 dark:text-slate-400">Acompanhe o histórico de seus pedidos</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                        <div className="bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package size={40} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('orders.empty')}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                            Você ainda não realizou nenhuma compra.
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
                                            <div className="flex gap-2">
                                                {getStatusBadge(order.status)}
                                                {getPaymentStatusBadge(order.payment_status)}
                                            </div>
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

                                        {/* Pix QR Code Button */}
                                        {order.payment_status !== 'paid' && order.payment_method.toLowerCase().includes('pix') && (order.payment_metadata?.qr_code || order.payment_metadata?.transaction_data?.qr_code) && (
                                            <button
                                                onClick={() => setSelectedPixOrder(order)}
                                                className="px-4 py-2 bg-blue-50 text-blue-600 dark:text-blue-400 dark:bg-blue-900/20 rounded-lg text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-2"
                                            >
                                                💠 Ver PIX
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pix Modal */}
            {selectedPixOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full relative">
                        <button
                            onClick={() => setSelectedPixOrder(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <XCircle size={24} />
                        </button>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                💠
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Pagamento Pix</h3>
                            <p className="text-sm text-slate-500 mb-6">Escaneie o QR Code ou copie o código.</p>

                            {(selectedPixOrder.payment_metadata?.qr_code_base64 || selectedPixOrder.payment_metadata?.transaction_data?.qr_code_base64) && (
                                <div className="mb-6 p-4 bg-white border rounded-xl shadow-sm inline-block">
                                    <img
                                        src={`data:image/jpeg;base64,${selectedPixOrder.payment_metadata?.qr_code_base64 || selectedPixOrder.payment_metadata?.transaction_data?.qr_code_base64}`}
                                        alt="QR Code Pix"
                                        className="w-48 h-48 object-contain"
                                    />
                                </div>
                            )}

                            <div className="w-full mb-6">
                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block text-left">Código Pix Copia e Cola</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={selectedPixOrder.payment_metadata?.qr_code || selectedPixOrder.payment_metadata?.transaction_data?.qr_code}
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 truncate font-mono"
                                    />
                                    <button
                                        onClick={handleCopyPix}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Copiar
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedPixOrder(null)}
                                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
