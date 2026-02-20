import React from 'react';

interface OrderSummaryPanelProps {
    items: any[];
    selectedMethodId: string;
    cartTotal: number;
    discountAmount: number;
    deliveryFee: number;
    finalTotal: number;
    deliveryType: 'pickup' | 'delivery';
    isCalculatingFee: boolean;
}

export default function OrderSummaryPanel({
    items,
    selectedMethodId,
    cartTotal,
    discountAmount,
    deliveryFee,
    finalTotal,
    deliveryType,
    isCalculatingFee
}: OrderSummaryPanelProps) {
    return (
        <div className="p-6 rounded-xl shadow-lg border sticky top-24"
            style={{
                backgroundColor: 'var(--store-card)',
                borderColor: 'var(--store-border)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
            <h3 className="font-bold text-lg mb-6 flex items-center justify-between border-b pb-4"
                style={{ color: 'var(--store-text)', borderColor: 'var(--store-border)' }}>
                <span>Resumo do Pedido</span>
                <span className="text-xs font-bold px-2 py-1 rounded-md"
                    style={{ backgroundColor: 'var(--store-bg)', color: 'var(--store-text-muted)' }}>{items.length} itens</span>
            </h3>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => {
                    const discountRule = selectedMethodId ? item.product.discounts?.find((d: any) => d.payment_method_id === selectedMethodId) : null;
                    const hasDiscount = !!discountRule;
                    const itemPrice = parseFloat(item.product.price);
                    const discountedPrice = hasDiscount ? itemPrice * (1 - Number(discountRule.percentage) / 100) : itemPrice;

                    return (
                        <div key={item.product.id} className="flex justify-between items-start text-sm group">
                            <div className="flex gap-3">
                                <span className="font-bold px-2 py-0.5 rounded text-xs h-fit"
                                    style={{ backgroundColor: 'var(--store-bg)', color: 'var(--store-text)' }}>{item.quantity}x</span>
                                <div className="flex flex-col">
                                    <span className="w-32 truncate" style={{ color: 'var(--store-text-muted)' }}>{item.product.name}</span>
                                    {hasDiscount && (
                                        <span className="text-[10px] text-green-600 font-bold">{Number(discountRule.percentage)}% OFF</span>
                                    )}
                                    {item.observation && (
                                        <span className="text-[10px] italic mt-0.5 opacity-70" style={{ color: 'var(--store-text-muted)' }}>"{item.observation}"</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                {hasDiscount && (
                                    <span className="block text-[10px] line-through text-red-400">R$ {(itemPrice * item.quantity).toFixed(2).replace('.', ',')}</span>
                                )}
                                <span className="font-medium whitespace-nowrap" style={{ color: 'var(--store-text)' }}>R$ {(discountedPrice * item.quantity).toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="my-6 border-t border-dashed" style={{ borderColor: 'var(--store-border)' }}></div>

            <div className="space-y-3">
                <div className="flex justify-between text-sm" style={{ color: 'var(--store-text-muted)' }}>
                    <span>Subtotal</span>
                    <span className="font-medium">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: 'var(--store-text-muted)' }}>
                    <span>Descontos</span>
                    {discountAmount > 0 ? (
                        <span className="font-bold" style={{ color: 'rgb(22, 163, 74)' }}>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                    ) : (
                        <span className="text-gray-300">-</span>
                    )}
                </div>
                {deliveryType === 'delivery' && (
                    <div className="flex justify-between text-sm" style={{ color: 'var(--store-text-muted)' }}>
                        <span>Taxa de Entrega</span>
                        {isCalculatingFee ? (
                            <span className="animate-pulse">Calculando...</span>
                        ) : (
                            <span className="font-bold">
                                {deliveryFee > 0 ? `+ R$ ${deliveryFee.toFixed(2).replace('.', ',')}` : 'Grátis'}
                            </span>
                        )}
                    </div>
                )}
                <div className="flex justify-between text-xl font-extrabold mt-6 pt-4 border-t"
                    style={{ color: 'var(--store-text)', borderColor: 'var(--store-border)' }}>
                    <span>Total</span>
                    <span>R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>
        </div>
    );
}
