'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import Cookies from 'js-cookie';
import { useLanguage } from '@/app/context/LanguageContext';
import { Order } from '@/app/types/order';
import KanbanColumn from '@/app/components/KanbanColumn';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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

    useEffect(() => {
        fetchOrders();

        // Auto-refresh every 2 minutes
        const interval = setInterval(() => {
            fetchOrders();
        }, 120000);

        return () => clearInterval(interval);
    }, []);

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

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const orderId = Number(active.id);
        const newStatus = over.id as string;

        // Optimistic update
        const originalOrders = [...orders];

        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                return { ...o, status: newStatus as any };
            }
            return o;
        }));

        // API Call
        try {
            await fetch(`${apiUrl}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (error) {
            console.error('Failed to update status', error);
            setOrders(originalOrders); // Revert
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-choco">{t('orders.title')}</h1>
                <button onClick={fetchOrders} className="text-brand-choco hover:rotate-180 transition-transform">
                    🔄
                </button>
            </div>

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
