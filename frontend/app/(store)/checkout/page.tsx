'use client';

import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import jsCookie from 'js-cookie';

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    // States
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'money'>('pix');
    const [changeFor, setChangeFor] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');

    // Protect Route
    useEffect(() => {
        const token = jsCookie.get('auth_token');
        if (!token) {
            router.push('/signin?redirect=/checkout');
        }
    }, [router]);

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fadeIn">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl opacity-50 grayscale">🛒</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Cesta Vazia</h2>
                <p className="text-gray-400 mb-6">Você precisa adicionar delícias antes de finalizar.</p>
                <Link href="/" className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-900/10">
                    Voltar para o Cardápio
                </Link>
            </div>
        );
    }

    const handleFinishOrder = async () => {
        if (!user) return;
        setIsSubmitting(true);

        const orderData = {
            total_price: cartTotal,
            status: 'pending',
            items: items.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.product.price,
                subtotal: item.quantity * parseFloat(item.product.price)
            })),
            notes: JSON.stringify({
                type: 'pickup',
                payment_method: paymentMethod,
                change_for: paymentMethod === 'money' ? changeFor : null,
                pickup_address: 'Rua das Gostosuras, 123'
            })
        };

        try {
            const token = jsCookie.get('auth_token'); // Correct key
            const res = await fetch(`${apiUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                toast.success("Pedido realizado com sucesso! 🎉");
                clearCart();
                router.push('/orders/my');
            } else {
                const errorData = await res.json();
                console.error("Order error", errorData);
                toast.error("Erro ao realizar pedido. Tente novamente.");
            }
        } catch (error) {
            console.error("Order error", error);
            toast.error("Erro de conexão.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pb-32 animate-fadeIn transition-colors duration-500" style={{ backgroundColor: 'var(--store-bg)' }}>
            <div className="max-w-6xl mx-auto px-4 pt-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/cart" className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all shadow-sm hover:scale-105"
                        style={{
                            backgroundColor: 'var(--store-card)',
                            borderColor: 'var(--store-border)',
                            color: 'var(--store-text-muted)'
                        }}>
                        ←
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--store-text)' }}>Finalizar Pedido</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column - Forms */}
                    <div className="md:col-span-2 space-y-6">

                        {/* 1. Withdrawal Info */}
                        <section className="p-6 rounded-xl shadow-sm border"
                            style={{
                                backgroundColor: 'var(--store-card)',
                                borderColor: 'var(--store-border)'
                            }}>
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl grayscale"
                                    style={{ backgroundColor: 'var(--store-bg)' }}>
                                    🏪
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--store-text)' }}>Retirada na Loja</h3>
                                    <p className="leading-relaxed text-sm" style={{ color: 'var(--store-text-muted)' }}>
                                        Rua das Gostosuras, 123<br />
                                        Bairro Doce Vida, São Paulo - SP
                                    </p>
                                    <div className="mt-4 flex items-center gap-3">
                                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2"
                                            style={{ backgroundColor: 'var(--store-bg)', color: 'var(--store-text)' }}>
                                            ⏱️ ~20 min
                                        </span>
                                        <a
                                            href="https://maps.google.com"
                                            target="_blank"
                                            className="text-xs font-bold hover:underline flex items-center gap-1"
                                            style={{ color: 'var(--store-text)' }}
                                        >
                                            Ver no mapa ↗
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Payment Method */}
                        <section className="p-6 rounded-xl shadow-sm border"
                            style={{
                                backgroundColor: 'var(--store-card)',
                                borderColor: 'var(--store-border)'
                            }}>
                            <h3 className="font-bold text-lg mb-5 flex items-center gap-2" style={{ color: 'var(--store-text)' }}>
                                Pagamento
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Pix Option */}
                                <label className={`relative group p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2`}
                                    style={{
                                        borderColor: paymentMethod === 'pix' ? 'var(--store-text)' : 'var(--store-border)',
                                        backgroundColor: paymentMethod === 'pix' ? 'var(--store-bg)' : 'transparent'
                                    }}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="sr-only"
                                        checked={paymentMethod === 'pix'}
                                        onChange={() => setPaymentMethod('pix')}
                                    />
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl grayscale">💠</span>
                                        {paymentMethod === 'pix' && (
                                            <div className="w-4 h-4 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: 'var(--store-text)' }}>
                                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <span className="font-bold block" style={{ color: paymentMethod === 'pix' ? 'var(--store-text)' : 'var(--store-text-muted)' }}>Pix</span>
                                        <span className="text-xs font-medium" style={{ color: 'var(--store-text-muted)' }}>Aprovação imediata</span>
                                    </div>
                                    {paymentMethod === 'pix' && (
                                        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full border"
                                            style={{
                                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                color: 'rgb(21, 128, 61)',
                                                borderColor: 'rgba(34, 197, 94, 0.2)'
                                            }}>
                                            5% OFF
                                        </span>
                                    )}
                                </label>

                                {/* Money Option */}
                                <label className={`relative group p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2`}
                                    style={{
                                        borderColor: paymentMethod === 'money' ? 'var(--store-text)' : 'var(--store-border)',
                                        backgroundColor: paymentMethod === 'money' ? 'var(--store-bg)' : 'transparent'
                                    }}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="sr-only"
                                        checked={paymentMethod === 'money'}
                                        onChange={() => setPaymentMethod('money')}
                                    />
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl grayscale">💵</span>
                                        {paymentMethod === 'money' && (
                                            <div className="w-4 h-4 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: 'var(--store-text)' }}>
                                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <span className="font-bold block" style={{ color: paymentMethod === 'money' ? 'var(--store-text)' : 'var(--store-text-muted)' }}>Dinheiro</span>
                                        <span className="text-xs font-medium" style={{ color: 'var(--store-text-muted)' }}>Pagar na retirada</span>
                                    </div>
                                </label>
                            </div>

                            {/* Change Input Animation */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${paymentMethod === 'money' ? 'max-h-32 opacity-100 mt-5' : 'max-h-0 opacity-0'}`}>
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
                                    <p className="text-[10px] mt-2 pl-8" style={{ color: 'var(--store-text-muted)' }}>Deixe vazio se tiver o valor exato.</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Summary (Sticky) */}
                    <div className="md:col-span-1">
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
                                {items.map(item => (
                                    <div key={item.product.id} className="flex justify-between items-start text-sm group">
                                        <div className="flex gap-3">
                                            <span className="font-bold px-2 py-0.5 rounded text-xs h-fit"
                                                style={{ backgroundColor: 'var(--store-bg)', color: 'var(--store-text)' }}>{item.quantity}x</span>
                                            <span className="w-32 truncate" style={{ color: 'var(--store-text-muted)' }}>{item.product.name}</span>
                                        </div>
                                        <span className="font-medium whitespace-nowrap" style={{ color: 'var(--store-text)' }}>R$ {(parseFloat(item.product.price) * item.quantity).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="my-6 border-t border-dashed" style={{ borderColor: 'var(--store-border)' }}></div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm" style={{ color: 'var(--store-text-muted)' }}>
                                    <span>Subtotal</span>
                                    <span className="font-medium">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-sm" style={{ color: 'var(--store-text-muted)' }}>
                                    <span>Desconto (Pix)</span>
                                    {paymentMethod === 'pix' ? (
                                        <span className="font-bold" style={{ color: 'rgb(22, 163, 74)' }}>- R$ {(cartTotal * 0.05).toFixed(2).replace('.', ',')}</span>
                                    ) : (
                                        <span className="text-gray-300">-</span>
                                    )}
                                </div>
                                <div className="flex justify-between text-xl font-extrabold mt-6 pt-4 border-t"
                                    style={{ color: 'var(--store-text)', borderColor: 'var(--store-border)' }}>
                                    <span>Total</span>
                                    <span>R$ {(paymentMethod === 'pix' ? cartTotal * 0.95 : cartTotal).toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleFinishOrder}
                                disabled={isSubmitting}
                                className={`w-full py-4 rounded-xl font-bold text-base shadow-xl flex items-center justify-center gap-3 transition-all mt-8 group hover:opacity-90 active:scale-[0.98]
                                    ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
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

                            <p className="text-center text-[10px] mt-4 leading-relaxed" style={{ color: 'var(--store-text-muted)' }}>
                                Ao confirmar, você concorda com nossos <br /><Link href="#" className="underline hover:text-gray-900">termos de serviço</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
