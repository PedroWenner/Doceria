import React from 'react';
import Link from 'next/link';
import { Payment } from '@mercadopago/sdk-react';

interface PaymentMethodsPanelProps {
    paymentMethods: any[];
    selectedMethodId: string;
    setSelectedMethodId: (id: string) => void;
    items: any[];
    changeFor: string;
    setChangeFor: (val: string) => void;
    isMoney: boolean;
    isSubmitting: boolean;
    handleFinishOrder: () => void;
    isMercadoPagoInitialized: boolean;
    isPix: boolean;
    isCard: boolean;
    paymentInitialization: any;
    paymentCustomization: any;
    handleBrickSubmit: (result: any) => Promise<void>;
}

export default function PaymentMethodsPanel({
    paymentMethods,
    selectedMethodId,
    setSelectedMethodId,
    items,
    changeFor,
    setChangeFor,
    isMoney,
    isSubmitting,
    handleFinishOrder,
    isMercadoPagoInitialized,
    isPix,
    isCard,
    paymentInitialization,
    paymentCustomization,
    handleBrickSubmit
}: PaymentMethodsPanelProps) {
    return (
        <section className="p-6 rounded-xl shadow-sm border"
            style={{
                backgroundColor: 'var(--store-card)',
                borderColor: 'var(--store-border)'
            }}>
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2" style={{ color: 'var(--store-text)' }}>
                Pagamento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentMethods.map(method => {
                    // Calculate discount just to show badge
                    const hasDiscount = items.some(item =>
                        item.product.discounts?.some((d: any) => d.payment_method_id === method.id)
                    );

                    return (
                        <label key={method.id} className={`relative group p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2`}
                            style={{
                                borderColor: selectedMethodId === String(method.id) ? 'var(--store-text)' : 'var(--store-border)',
                                backgroundColor: selectedMethodId === String(method.id) ? 'var(--store-bg)' : 'transparent'
                            }}>
                            <input
                                type="radio"
                                name="payment"
                                className="sr-only"
                                checked={selectedMethodId === String(method.id)}
                                onChange={() => setSelectedMethodId(String(method.id))}
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-2xl grayscale">
                                    {method.slug.includes('pix') ? '💠' :
                                        method.slug.includes('money') || method.slug.includes('dinheiro') ? '💵' :
                                            method.slug.includes('card') || method.slug.includes('cartao') ? '💳' : '💰'}
                                </span>
                                {selectedMethodId === String(method.id) && (
                                    <div className="w-4 h-4 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: 'var(--store-text)' }}>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <span className="font-bold block" style={{ color: selectedMethodId === String(method.id) ? 'var(--store-text)' : 'var(--store-text-muted)' }}>{method.name}</span>
                                <span className="text-xs font-medium" style={{ color: 'var(--store-text-muted)' }}>{method.slug.includes('pix') ? 'Aprovação imediata' : 'Pagar na retirada'}</span>
                            </div>

                            {/* Dynamic Discount Badge Check */}
                            {hasDiscount && (
                                <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full border"
                                    style={{
                                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                        color: 'rgb(21, 128, 61)',
                                        borderColor: 'rgba(34, 197, 94, 0.2)'
                                    }}>
                                    DESCONTOS
                                </span>
                            )}
                        </label>
                    );
                })}
            </div>

            {/* Change Input Animation */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${(paymentMethods.find(m => m.id === selectedMethodId)?.slug === 'money' ||
                paymentMethods.find(m => m.id === selectedMethodId)?.slug === 'dinheiro')
                ? 'max-h-32 opacity-100 mt-5' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 rounded-xl border"
                    style={{
                        backgroundColor: 'var(--store-bg)',
                        borderColor: 'var(--store-border)'
                    }}>
                    <label className="text-xs font-bold mb-2 block uppercase tracking-wide" style={{ color: 'var(--store-text)' }}>Troco para quanto?</label>
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg" style={{ color: 'var(--store-text-muted)' }}>R$</span>
                        <input
                            type="text"
                            placeholder="Ex: 50,00"
                            className="flex-1 border rounded-lg p-3 font-bold outline-none transition-all placeholder:text-gray-300 focus:ring-1"
                            style={{
                                backgroundColor: 'var(--store-card)',
                                borderColor: 'var(--store-border)',
                                color: 'var(--store-text)',
                                '--tw-ring-color': 'var(--store-text)'
                            } as React.CSSProperties}
                            value={changeFor}
                            onChange={(e) => setChangeFor(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="my-6 border-t border-dashed" style={{ borderColor: 'var(--store-border)' }}></div>

            {/* Conditional Button: Money uses normal button, Online uses Brick */}
            {isMoney ? (
                <button
                    onClick={handleFinishOrder}
                    disabled={isSubmitting || !selectedMethodId}
                    className={`w-full py-4 rounded-xl font-bold text-base shadow-xl flex items-center justify-center gap-3 transition-all mt-8 group hover:opacity-90 active:scale-[0.98]
                        ${(isSubmitting || !selectedMethodId) ? 'opacity-70 cursor-not-allowed' : ''}
                    `}
                    style={{
                        backgroundColor: 'var(--store-primary)',
                        color: 'var(--store-primary-fg)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    {isSubmitting ? (
                        <>
                            <span className="animate-spin text-xl">🍩</span>
                            <span>Processando...</span>
                        </>
                    ) : (
                        <>
                            <span>Confirmar Pedido</span>
                            <span>➜</span>
                        </>
                    )}
                </button>
            ) : (
                <div className="mt-8">
                    {isMercadoPagoInitialized && (isPix || isCard) ? (
                        <div key={selectedMethodId} className="min-h-[200px]">
                            <Payment
                                initialization={paymentInitialization}
                                customization={paymentCustomization}
                                onSubmit={handleBrickSubmit}
                                onError={(error) => {
                                    console.error('Brick error:', error);
                                }}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-3 border-2 border-dashed border-slate-200 rounded-xl">
                            <span className="animate-pulse text-2xl">⏳</span>
                            <span className="text-sm font-medium">Carregando gateway seguro...</span>
                        </div>
                    )}
                </div>
            )}

            <p className="text-center text-[10px] mt-4 leading-relaxed" style={{ color: 'var(--store-text-muted)' }}>
                Ao confirmar, você concorda com nossos <br /><Link href="#" className="underline hover:text-gray-900">termos de serviço</Link>.
            </p>
        </section>
    );
}
