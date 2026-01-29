'use client';

import { useDroppable } from '@dnd-kit/core';
import { Order } from '@/app/types/order';
import OrderCard from './OrderCard';
import { useLanguage } from '@/app/context/LanguageContext';

interface Props {
    id: string;
    title: string;
    orders: Order[];
    color: string; // Keep for backward compatibility but we might map it to borders
}

export default function KanbanColumn({ id, title, orders, color }: Props) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    const { t } = useLanguage();

    // Map legacy colors to new border colors
    const getStatusColor = (statusId: string) => {
        switch (statusId) {
            case 'pending': return 'border-amber-400 text-amber-900 dark:text-amber-100 bg-amber-50 dark:bg-amber-900/20';
            case 'preparing': return 'border-sky-500 text-sky-900 dark:text-sky-100 bg-sky-50 dark:bg-sky-900/20';
            case 'ready': return 'border-emerald-500 text-emerald-900 dark:text-emerald-100 bg-emerald-50 dark:bg-emerald-900/20';
            case 'delivered': return 'border-slate-500 text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800';
            default: return 'border-slate-300 text-slate-700 bg-slate-50';
        }
    };

    const statusStyle = getStatusColor(id);

    return (
        <div className="flex-shrink-0 w-80 flex flex-col h-full max-h-[calc(100vh-140px)] bg-slate-100/50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className={`p-4 rounded-t-xl font-bold border-b-2 flex justify-between items-center ${statusStyle.split(' ')[0]} ${statusStyle.split(' ')[3]}`}>
                <span className={`${statusStyle.split(' ')[1]} ${statusStyle.split(' ')[2]}`}>{t(title)}</span>
                <span className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded text-xs font-mono">
                    {orders.length}
                </span>
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className={`flex-1 p-3 overflow-y-auto transition-colors ${isOver ? 'bg-slate-200/50 dark:bg-slate-800/50' : ''
                    }`}
            >
                {orders.map(order => (
                    <OrderCard key={order.id} order={order} />
                ))}

                {orders.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl m-2">
                        <span className="opacity-50">Sem pedidos</span>
                    </div>
                )}
            </div>
        </div>
    );
}
