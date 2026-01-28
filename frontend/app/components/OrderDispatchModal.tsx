'use client';

import { useState } from 'react';
import { Order } from '@/app/types/order';
import { useLanguage } from '@/app/context/LanguageContext';

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-brand-pink/20 animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold text-brand-choco mb-4">
                    {status === 'delivered' ? 'Despachar Entrega 🛵' : 'Concluir Pedido ✅'}
                </h2>

                <div className="bg-brand-pink/5 p-4 rounded-lg mb-6 text-sm text-brand-choco/80">
                    <p><strong>Cliente:</strong> {order.customer_name}</p>
                    <p><strong>Tipo:</strong> {isDelivery ? 'Entrega' : 'Retirada'}</p>
                    {isDelivery && order.delivery_address && (
                        <p className="mt-2 text-xs opacity-70">
                            <strong>Endereço:</strong> {order.delivery_address.street}, {order.delivery_address.number}
                        </p>
                    )}
                </div>

                {isDelivery && status === 'delivered' ? (
                    <form onSubmit={handleSubmit}>
                        <label className="block text-sm font-medium text-brand-choco mb-2">
                            Nome do Entregador
                        </label>
                        <input
                            type="text"
                            required
                            value={courierName}
                            onChange={e => setCourierName(e.target.value)}
                            placeholder="Ex: João Motoboy"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-pink outline-none mb-6"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-brand-choco/60 hover:text-brand-choco"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-brand-pink text-white rounded-lg font-bold hover:bg-brand-pink/90"
                            >
                                Confirmar Envio
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        {!isDelivery && (
                            <a
                                href={getWhatsAppLink()}
                                target="_blank"
                                rel="noreferrer"
                                className="block w-full text-center py-3 bg-green-500 text-white rounded-lg font-bold mb-4 hover:bg-green-600 transition-colors"
                            >
                                💬 Avisar no WhatsApp
                            </a>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-brand-choco/60 hover:text-brand-choco"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => onConfirm()}
                                className="px-6 py-2 bg-brand-choco text-white rounded-lg font-bold hover:bg-brand-choco/90"
                            >
                                {isDelivery ? 'Confirmar' : 'Finalizar'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
