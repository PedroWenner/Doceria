'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Order } from '@/app/types/order';
import { useLanguage } from '@/app/context/LanguageContext';
import { displayCurrency } from '@/app/utils/formatters';

interface Props {
    order: Order;
}

export default function OrderCard({ order }: Props) {
    const { t } = useLanguage();
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: order.id.toString(),
        data: { order }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                bg-white/60 p-4 rounded-xl shadow-sm border border-brand-gold/20 mb-3 
                cursor-grab active:cursor-grabbing hover:bg-white/80 transition-all
                ${isDragging ? 'shadow-2xl rotate-2 scale-105' : ''}
            `}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-brand-choco text-lg">#{order.id}</span>
                <span className="text-xs font-mono text-brand-choco/60">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <h3 className="font-bold text-brand-choco mb-1">{order.customer_name || 'Guest'}</h3>

            <div className="text-sm text-brand-choco/80 mb-3 line-clamp-2">
                {order.items.map(i => `${i.quantity}x ${i.product?.name || 'Product'}`).join(', ')}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-brand-choco/10">
                <span className="text-xs bg-brand-pink/10 px-2 py-1 rounded text-brand-pink font-bold">
                    {order.payment_method}
                </span>
                <span className="font-bold text-green-700">
                    {displayCurrency(order.total_amount)}
                </span>
            </div>
        </div>
    );
}
