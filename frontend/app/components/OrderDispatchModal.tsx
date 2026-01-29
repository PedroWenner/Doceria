'use client';

import { useState } from 'react';
import { Order } from '@/app/types/order';
import { useLanguage } from '@/app/context/LanguageContext';
import {
    X,
    Bike,
    CheckCircle,
    MessageCircle,
    User,
    MapPin,
    Clock,
    Truck
} from 'lucide-react';

interface Props {
    isOpen: boolean;
    order: Order | null;
    status: string;
    onClose: () => void;
    onConfirm: (courierName?: string) => void;
}

export default function OrderDispatchModal({ isOpen, order, status, onClose, onConfirm }: Props) {
    const { t } = useLanguage();
    const [courierName, setCourierName] = useState('');

    if (!isOpen || !order) return null;

    const isDelivery = order.delivery_type === 'delivery';
    const isDispatching = status === 'delivered' || status === 'ready';

    const getWhatsAppLink = () => {
        const phone = order.customer_phone?.replace(/[^\d]/g, '') || '';
        const text = `Olá ${order.customer_name}, seu pedido #${order.id} está pronto para retirada! 🧁`;
        return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(courierName);
    };

    return (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-scaleIn">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                            {status === 'delivered' ? <Bike size={20} className="text-sky-500" /> : <CheckCircle size={20} className="text-emerald-500" />}
                            {status === 'delivered' ? 'Despachar Entrega' : 'Concluir Pedido'}
                        </h2>
                        <span className="text-xs font-mono text-slate-400">Order #{order.id}</span>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Customer Summary Card */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-6 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <User size={14} className="text-slate-400" />
                            <span className="font-semibold">{order.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            {isDelivery ? <Truck size={14} className="text-slate-400" /> : <Clock size={14} className="text-slate-400" />}
                            <span>{isDelivery ? 'Entrega em domicílio' : 'Retirada no balcão'}</span>
                        </div>
                        {isDelivery && order.delivery_address && (
                            <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800 mt-2">
                                <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                                <span>{order.delivery_address.street}, {order.delivery_address.number}</span>
                            </div>
                        )}
                    </div>

                    {isDelivery && status === 'delivered' ? (
                        <form onSubmit={handleSubmit}>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                Nome do Entregador
                            </label>
                            <div className="relative mb-6">
                                <Bike className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={courierName}
                                    onChange={e => setCourierName(e.target.value)}
                                    placeholder="Ex: João Motoboy"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none transition-all"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg shadow-slate-900/10"
                                >
                                    Confirmar Envio
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {!isDelivery && (
                                <a
                                    href={getWhatsAppLink()}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#20bd5a] transition-all shadow-md active:scale-[0.98]"
                                >
                                    <MessageCircle size={20} />
                                    Avisar no WhatsApp
                                </a>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => onConfirm()}
                                    className="px-5 py-2 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg shadow-slate-900/10"
                                >
                                    {isDelivery ? 'Confirmar' : 'Finalizar Pedido'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
