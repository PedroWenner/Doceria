'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import Cookies from 'js-cookie';
import { useLanguage } from '@/app/context/LanguageContext';
import { Order } from '@/app/types/order';
import KanbanColumn from '@/app/components/KanbanColumn';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import OrderDispatchModal from '@/app/components/OrderDispatchModal';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshRate, setRefreshRate] = useState(120);
    const [secondsLeft, setSecondsLeft] = useState(120);
    const { t } = useLanguage();

    // Status config
    const columns = [
        { id: 'pending', title: 'orders.pending', color: 'bg-yellow-200/80' },
        { id: 'preparing', title: 'orders.preparing', color: 'bg-blue-200/80' },
        { id: 'ready', title: 'orders.ready', color: 'bg-green-200/80' },
        { id: 'delivered', title: 'orders.delivered', color: 'bg-gray-200/80' }
    ];

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = Cookies.get('auth_token');

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

    // Calculate progress for the timer circle
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - ((refreshRate - secondsLeft) / refreshRate) * circumference;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-end mb-6">
                <h1 className="text-3xl font-bold text-brand-choco">{t('orders.title')}</h1>

                {/* Countdown Timer Widget */}
                <div
                    onClick={handleManualRefresh}
                    className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full cursor-pointer hover:bg-white/80 transition-all border border-brand-gold/20 shadow-sm group"
                    title="Clique para atualizar agora"
                >
                    <div className="relative flex items-center justify-center">
                        <svg className="transform -rotate-90 w-10 h-10">
                            <circle
                                cx="20"
                                cy="20"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="transparent"
                                className="text-brand-cream/50"
                            />
                            <circle
                                cx="20"
                                cy="20"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                className="text-brand-pink transition-all duration-1000 ease-linear"
                            />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-brand-choco">{secondsLeft}</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-xs font-bold text-brand-choco uppercase tracking-wider">{t('orders.next_update')}</span>
                        <span className="block text-[10px] text-brand-choco/60 group-hover:text-brand-pink transition-colors">{t('orders.force_refresh')}</span>
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
                <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">
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
            </DndContext>
        </div>
    );
}
