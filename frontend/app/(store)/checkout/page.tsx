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
                <h2 className="text-2xl font-bold text-brand-choco mb-2">Cesta Vazia</h2>
                <p className="text-gray-400 mb-6">Você precisa adicionar delícias antes de finalizar.</p>
                <Link href="/" className="px-8 py-3 bg-brand-pink text-white rounded-full font-bold shadow-lg shadow-brand-pink/30 hover:scale-105 transition-all">
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
        <div className="min-h-screen bg-gradient-to-b from-brand-cream/20 to-white pb-32 animate-fadeIn">
            <div className="max-w-6xl mx-auto px-4 pt-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/cart" className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-brand-pink hover:border-brand-pink transition-all">
                        ←
                    </Link>
                    <h1 className="text-2xl font-bold text-brand-choco">Finalizar Pedido</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column - Forms */}
                    <div className="md:col-span-2 space-y-6">

                        {/* 1. Withdrawal Info */}
                        <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-2xl text-brand-pink">
                                    🏪
                                </div>
                                <div>
                                    <h3 className="font-bold text-brand-choco text-lg mb-1">Retirada na Loja</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">
                                        Rua das Gostosuras, 123<br />
                                        Bairro Doce Vida, São Paulo - SP
                                    </p>
                                    <div className="mt-3 flex items-center gap-3">
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            ⚡ Pronto em ~20 min
                                        </span>
                                        <a
                                            href="https://maps.google.com"
                                            target="_blank"
                                            className="text-brand-pink text-xs font-bold hover:underline flex items-center gap-1"
                                        >
                                            📍 Ver no mapa
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Payment Method */}
                        <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-brand-choco text-lg mb-4 flex items-center gap-2">
                                <span>💳</span> Pagamento na Retirada
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Pix Option */}
                                <label className={`relative group p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2
                                    ${paymentMethod === 'pix' ? 'border-brand-pink bg-brand-pink/5 shadow-inner' : 'border-gray-100 hover:border-brand-pink/30 hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="sr-only" // Hide default radio
                                        checked={paymentMethod === 'pix'}
                                        onChange={() => setPaymentMethod('pix')}
                                    />
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">💠</span>
                                        {paymentMethod === 'pix' && <span className="w-3 h-3 bg-brand-pink rounded-full shadow-sm ring-2 ring-white"></span>}
                                    </div>
                                    <div>
                                        <span className={`font-bold block ${paymentMethod === 'pix' ? 'text-brand-pink' : 'text-gray-700'}`}>Pix</span>
                                        <span className="text-[10px] text-gray-400 font-medium">Chave ou QR Code</span>
                                    </div>
                                    <span className="absolute top-2 right-2 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-sm">
                                        -5% OFF
                                    </span>
                                </label>

                                {/* Money Option */}
                                <label className={`relative group p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2
                                    ${paymentMethod === 'money' ? 'border-brand-green bg-brand-green/5 shadow-inner' : 'border-gray-100 hover:border-brand-green/30 hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="sr-only"
                                        checked={paymentMethod === 'money'}
                                        onChange={() => setPaymentMethod('money')}
                                    />
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">💵</span>
                                        {paymentMethod === 'money' && <span className="w-3 h-3 bg-brand-green rounded-full shadow-sm ring-2 ring-white"></span>}
                                    </div>
                                    <div>
                                        <span className={`font-bold block ${paymentMethod === 'money' ? 'text-brand-green' : 'text-gray-700'}`}>Dinheiro</span>
                                        <span className="text-[10px] text-gray-400 font-medium">Pagamento no balcão</span>
                                    </div>
                                </label>
                            </div>

                            {/* Change Input Animation */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${paymentMethod === 'money' ? 'max-h-32 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Troco para quanto?</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 font-bold">R$</span>
                                        <input
                                            type="text"
                                            placeholder="Ex: 50,00"
                                            className="flex-1 bg-white border border-gray-200 rounded-lg p-2.5 text-brand-choco font-bold outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all"
                                            value={changeFor}
                                            onChange={(e) => setChangeFor(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 pl-6">Deixe vazio se tiver o valor exato.</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Summary (Sticky) */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-brand-choco/5 border border-gray-50 sticky top-24 relative overflow-hidden">
                            {/* Receipt Decoration */}
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-pink/20 via-brand-pink/10 to-brand-gold/20"></div>

                            <h3 className="font-bold text-brand-choco text-lg mb-4 flex items-center justify-between">
                                <span>Resumo</span>
                                <span className="text-xs font-normal bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{items.length} itens</span>
                            </h3>

                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map(item => (
                                    <div key={item.product.id} className="flex justify-between items-start text-sm group">
                                        <div className="flex gap-2">
                                            <span className="font-bold text-brand-pink bg-brand-pink/5 px-1.5 rounded text-xs h-fit mt-0.5">{item.quantity}x</span>
                                            <span className="text-gray-600 group-hover:text-brand-choco transition-colors line-clamp-2">{item.product.name}</span>
                                        </div>
                                        <span className="text-gray-900 font-medium whitespace-nowrap">R$ {(parseFloat(item.product.price) * item.quantity).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="my-6 border-t border-dashed border-gray-200"></div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Desconto (Pix)</span>
                                    {paymentMethod === 'pix' ? (
                                        <span className="text-green-500 font-bold">- R$ {(cartTotal * 0.05).toFixed(2).replace('.', ',')}</span>
                                    ) : (
                                        <span className="text-gray-300">-</span>
                                    )}
                                </div>
                                <div className="flex justify-between text-xl font-bold text-brand-choco mt-4 pt-4 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>R$ {(paymentMethod === 'pix' ? cartTotal * 0.95 : cartTotal).toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleFinishOrder}
                                disabled={isSubmitting}
                                className={`w-full bg-brand-pink text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-brand-pink/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all mt-6 relative overflow-hidden
                                    ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-pink/90'}
                                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin text-2xl">🍩</span>
                                        <span>Processando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Confirmar Pedido</span>
                                        <span className="material-icons-round text-sm">➜</span>
                                    </>
                                )}
                            </button>

                            <p className="text-center text-[10px] text-gray-400 mt-4">
                                Ao confirmar, você concorda com nossos <a href="#" className="underline hover:text-brand-pink">termos de gostosura</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
