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
        <div className="min-h-screen bg-gray-50 pb-32 animate-fadeIn">
            <div className="max-w-6xl mx-auto px-4 pt-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/cart" className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-all shadow-sm">
                        ←
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Finalizar Pedido</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column - Forms */}
                    <div className="md:col-span-2 space-y-6">

                        {/* 1. Withdrawal Info */}
                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl grayscale">
                                    🏪
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-1">Retirada na Loja</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">
                                        Rua das Gostosuras, 123<br />
                                        Bairro Doce Vida, São Paulo - SP
                                    </p>
                                    <div className="mt-4 flex items-center gap-3">
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                                            ⏱️ ~20 min
                                        </span>
                                        <a
                                            href="https://maps.google.com"
                                            target="_blank"
                                            className="text-gray-900 text-xs font-bold hover:underline flex items-center gap-1"
                                        >
                                            Ver no mapa ↗
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Payment Method */}
                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                                Pagamento
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Pix Option */}
                                <label className={`relative group p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2
                                    ${paymentMethod === 'pix' ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="sr-only"
                                        checked={paymentMethod === 'pix'}
                                        onChange={() => setPaymentMethod('pix')}
                                    />
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl grayscale">💠</span>
                                        {paymentMethod === 'pix' && <div className="w-4 h-4 rounded-full bg-gray-900 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>}
                                    </div>
                                    <div>
                                        <span className={`font-bold block ${paymentMethod === 'pix' ? 'text-gray-900' : 'text-gray-600'}`}>Pix</span>
                                        <span className="text-xs text-gray-400 font-medium">Aprovação imediata</span>
                                    </div>
                                    {paymentMethod === 'pix' && (
                                        <span className="absolute top-3 right-3 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                            5% OFF
                                        </span>
                                    )}
                                </label>

                                {/* Money Option */}
                                <label className={`relative group p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2
                                    ${paymentMethod === 'money' ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="sr-only"
                                        checked={paymentMethod === 'money'}
                                        onChange={() => setPaymentMethod('money')}
                                    />
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl grayscale">💵</span>
                                        {paymentMethod === 'money' && <div className="w-4 h-4 rounded-full bg-gray-900 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>}
                                    </div>
                                    <div>
                                        <span className={`font-bold block ${paymentMethod === 'money' ? 'text-gray-900' : 'text-gray-600'}`}>Dinheiro</span>
                                        <span className="text-xs text-gray-400 font-medium">Pagar na retirada</span>
                                    </div>
                                </label>
                            </div>

                            {/* Change Input Animation */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${paymentMethod === 'money' ? 'max-h-32 opacity-100 mt-5' : 'max-h-0 opacity-0'}`}>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <label className="text-xs font-bold text-gray-900 mb-2 block uppercase tracking-wide">Troco para quanto?</label>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-500 font-bold text-lg">R$</span>
                                        <input
                                            type="text"
                                            placeholder="Ex: 50,00"
                                            className="flex-1 bg-white border border-gray-200 rounded-lg p-3 text-gray-900 font-bold outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder:text-gray-300"
                                            value={changeFor}
                                            onChange={(e) => setChangeFor(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 pl-8">Deixe vazio se tiver o valor exato.</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Summary (Sticky) */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center justify-between border-b border-gray-50 pb-4">
                                <span>Resumo do Pedido</span>
                                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{items.length} itens</span>
                            </h3>

                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map(item => (
                                    <div key={item.product.id} className="flex justify-between items-start text-sm group">
                                        <div className="flex gap-3">
                                            <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs h-fit">{item.quantity}x</span>
                                            <span className="text-gray-600 w-32 truncate">{item.product.name}</span>
                                        </div>
                                        <span className="text-gray-900 font-medium whitespace-nowrap">R$ {(parseFloat(item.product.price) * item.quantity).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="my-6 border-t border-dashed border-gray-200"></div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span className="font-medium">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Desconto (Pix)</span>
                                    {paymentMethod === 'pix' ? (
                                        <span className="text-green-600 font-bold">- R$ {(cartTotal * 0.05).toFixed(2).replace('.', ',')}</span>
                                    ) : (
                                        <span className="text-gray-300">-</span>
                                    )}
                                </div>
                                <div className="flex justify-between text-xl font-extrabold text-gray-900 mt-6 pt-4 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>R$ {(paymentMethod === 'pix' ? cartTotal * 0.95 : cartTotal).toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleFinishOrder}
                                disabled={isSubmitting}
                                className={`w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-base shadow-xl shadow-gray-900/10 flex items-center justify-center gap-3 hover:bg-black active:scale-[0.98] transition-all mt-8
                                    ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
                                `}
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

                            <p className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed">
                                Ao confirmar, você concorda com nossos <br /><Link href="#" className="underline hover:text-gray-900">termos de serviço</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
