'use client';

import { useDroppable } from '@dnd-kit/core';
import { Order } from '@/app/types/order';
import OrderCard from './OrderCard';
import { useLanguage } from '@/app/context/LanguageContext';

interface Props {
    id: string;
    title: string;
    orders: Order[];
    color: string;
}

export default function KanbanColumn({ id, title, orders, color }: Props) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    const { t } = useLanguage();

    return (
        <div className="flex-shrink-0 w-80 flex flex-col h-full max-h-[calc(100vh-140px)]">
            <div className={`p-4 rounded-t-xl font-bold text-brand-choco flex justify-between items-center ${color}`}>
                <span>{t(title)}</span>
                <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">
                    {orders.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className={`flex-1 p-3 overflow-y-auto bg-white/20 backdrop-blur-sm border-x border-b border-white/30 rounded-b-xl transition-colors ${isOver ? 'bg-brand-pink/10 ring-2 ring-brand-pink/30' : ''
                    }`}
            >
                {orders.map(order => (
                    <OrderCard key={order.id} order={order} />
                ))}

                {orders.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-brand-choco/40 text-sm border-2 border-dashed border-brand-choco/10 rounded-lg">
                        {t('orders.empty')}
                    </div>
                )}
            </div>
        </div>
    );
}
