'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import Cookies from 'js-cookie';
import { useLanguage } from '@/app/context/LanguageContext';
import { Order } from '@/app/types/order';
import KanbanColumn from '@/app/components/KanbanColumn';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import OrderDispatchModal from '@/app/components/OrderDispatchModal';
import {
    ClipboardList,
    Clock,
    RefreshCw,
    AlertCircle
} from 'lucide-react';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshRate, setRefreshRate] = useState(120);
    const [secondsLeft, setSecondsLeft] = useState(120);
    const { t } = useLanguage();

    // Status config
    const columns = [
        { id: 'pending', title: 'orders.pending', color: 'border-amber-400' },
        { id: 'preparing', title: 'orders.preparing', color: 'border-sky-500' },
        { id: 'ready', title: 'orders.ready', color: 'border-emerald-500' },
        { id: 'delivered', title: 'orders.delivered', color: 'border-slate-500' }
    ];

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = Cookies.get('admin_token');

    // Initial Load
    useEffect(() => {
        const init = async () => {
            await fetchSettings();
            await fetchOrders();
        };
        init();
    }, []);

    // Countdown & Auto-Refresh Logic
    useEffect(() => {
        if (!refreshRate) return;
        setSecondsLeft(refreshRate);

        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    fetchOrders();
                    return refreshRate;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [refreshRate]);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${apiUrl}/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const response = await res.json();
                if (response.data.orders_refresh_rate) {
                    const rate = response.data.orders_refresh_rate;
                    setRefreshRate(rate);
                    setSecondsLeft(rate);
                }
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${apiUrl}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const response = await res.json();
                setOrders(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualRefresh = () => {
        setSecondsLeft(refreshRate);
        fetchOrders();
    };

    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [targetStatus, setTargetStatus] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const orderId = Number(active.id);
        const newStatus = over.id as string;
        const currentOrder = orders.find(o => o.id === orderId);

        if (!currentOrder || currentOrder.status === newStatus) return;

        // Intercept logic
        if (newStatus === 'delivered' || (newStatus === 'ready' && currentOrder.delivery_type === 'pickup')) {
            setActiveOrder(currentOrder);
            setTargetStatus(newStatus);
            setIsModalOpen(true);
            return; // Stop drag until confirmed
        }

        updateOrderStatus(orderId, newStatus);
    };

    const updateOrderStatus = async (orderId: number, status: string, courierName?: string) => {
        // Optimistic Update
        const originalOrders = [...orders];
        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                return { ...o, status: status as any, courier_name: courierName };
            }
            return o;
        }));

        try {
            await fetch(`${apiUrl}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, courier_name: courierName })
            });
        } catch (error) {
            console.error('Failed to update status', error);
            setOrders(originalOrders);
        }
    };

    const handleConfirmDispatch = (courierName?: string) => {
        if (activeOrder) {
            updateOrderStatus(activeOrder.id, targetStatus, courierName);
            setIsModalOpen(false);
            setActiveOrder(null);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="h-full flex flex-col max-w-[1920px] mx-auto pb-6">
            <div className="flex justify-between items-end mb-8 px-1">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-3">
                        <ClipboardList size={32} className="text-slate-400" />
                        {t('orders.title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm ml-11">Gerenciamento visual do fluxo de pedidos.</p>
                </div>

                {/* Status Pills / Timer */}
                <div className="flex items-center gap-4">
                    <div
                        onClick={handleManualRefresh}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group border border-slate-200 dark:border-slate-700"
                        title="Clique para atualizar agora"
                    >
                        <RefreshCw size={16} className={`text-slate-500 group-hover:rotate-180 transition-transform duration-500 ${secondsLeft < 10 ? 'text-amber-500 animate-spin' : ''}`} />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono w-12 text-center">
                            {secondsLeft}s
                        </span>
                    </div>
                </div>
            </div>

            <OrderDispatchModal
                isOpen={isModalOpen}
                order={activeOrder}
                status={targetStatus}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmDispatch}
            />

            <DndContext onDragEnd={handleDragEnd}>
                <div className="flex-1 overflow-x-auto min-h-[500px]">
                    <div className="flex gap-6 h-full items-start px-1 pb-4 min-w-[1000px]">
                        {columns.map(col => (
                            <KanbanColumn
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                color={col.color}
                                orders={orders.filter(o => o.status === col.id)}
                            />
                        ))}
                    </div>
                </div>
            </DndContext>
        </div>
    );
}
