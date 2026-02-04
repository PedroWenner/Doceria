'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Order } from '@/app/types/order';
import { displayCurrency } from '@/app/utils/formatters';
import {
    User,
    MapPin,
    ShoppingBag,
    Clock,
    Wallet,
    StickyNote,
    GripVertical
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

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
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.9 : 1,
    };

    const translatePayment = (method: string) => {
        // @ts-ignore
        return t(`orders.payment.${method}`) || method;
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                group relative bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-3 
                cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all
                ${isDragging ? 'shadow-2xl rotate-2 scale-105 ring-2 ring-slate-900 dark:ring-slate-50' : ''}
            `}
            {...listeners}
            {...attributes}
        >
            {/* Drag Handle (Visible on Hover) */}
            <div className="absolute top-3 right-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={16} />
            </div>

            {/* Header: ID + Type */}
            <div className="flex justify-between items-start mb-3 pr-4">
                <span className="font-mono text-sm font-bold text-slate-500 dark:text-slate-400">#{order.id}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${order.delivery_type === 'delivery'
                    ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border-sky-100 dark:border-sky-900/30'
                    : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/30'
                    }`}>
                    {/* @ts-ignore */}
                    {t(`orders.delivery_type.${order.delivery_type}`)}
                </span>
            </div>

            {/* Customer Info */}
            <div className="mb-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-50 font-bold mb-0.5">
                    <User size={14} className="text-slate-400" />
                    <span className="truncate">{order.customer_name || 'Visitante'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Clock size={12} className="text-slate-300 dark:text-slate-600" />
                    <span>
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            {/* Items Summary */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 mb-3 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800/50">
                <div className="flex gap-1.5 mb-1">
                    <ShoppingBag size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="line-clamp-2 leading-relaxed">
                        {order.items.map(i => `${i.quantity}x ${i.product?.name || 'Item'}`).join(', ')}
                    </div>
                </div>
            </div>

            {/* Notes */}
            {order.notes && (
                <div className="flex gap-1.5 p-2 rounded bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-xs text-amber-700 dark:text-amber-500 mb-3">
                    <StickyNote size={12} className="mt-0.5 flex-shrink-0" />
                    <span className="italic">{order.notes}</span>
                </div>
            )}

            {/* Footer: Payment + Total */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Wallet size={12} />
                        <span>{translatePayment(order.payment_method)}</span>
                    </div>
                    {/* Payment Status Badge */}
                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center w-fit uppercase tracking-wider
                        ${order.payment_status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' :
                            order.payment_status === 'failed' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30' :
                                order.payment_status === 'refunded' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-900/30' :
                                    'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' // Pending/Canceled
                        }
                    `}>
                        {/* @ts-ignore */}
                        {t(`orders.payment_status.${order.payment_status}`) || order.payment_status}
                    </div>
                </div>
                <span className="font-bold text-slate-900 dark:text-emerald-400">
                    {displayCurrency(order.total_amount)}
                </span>
            </div>
        </div>
    );
}
