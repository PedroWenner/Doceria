'use client';

import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [apiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');

    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${apiUrl.replace('/api', '')}/storage/${path}`;
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 animate-fadeIn bg-gradient-to-b from-brand-cream/20 to-white">
                <div className="relative mb-8">
                    <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-xl shadow-brand-pink/10 animate-float z-10 relative">
                        <span className="text-6xl grayscale opacity-50">🛒</span>
                    </div>
                    <div className="absolute top-0 left-10 w-40 h-40 bg-brand-pink/5 rounded-full blur-3xl -z-10"></div>
                </div>

                <h2 className="text-3xl font-bold text-brand-choco mb-3">Sua cesta está vazia</h2>
                <p className="text-gray-400 mb-8 max-w-xs mx-auto leading-relaxed">
                    Nossas vitrines estão cheias de delícias esperando por você.
                </p>
                <Link
                    href="/"
                    className="px-10 py-4 bg-brand-pink text-white rounded-full font-bold text-lg shadow-xl shadow-brand-pink/30 hover:shadow-brand-pink/50 hover:scale-105 active:scale-95 transition-all"
                >
                    Ver Cardápio
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-brand-cream/20 to-white pb-32 animate-fadeIn">
            <div className="max-w-6xl mx-auto px-4 pt-6">

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-brand-choco">Sua Cesta <span className="text-brand-pink text-lg ml-2">({items.length} itens)</span></h1>
                    <button
                        onClick={clearCart}
                        className="text-xs font-bold text-red-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                    >
                        <span>🗑️</span> Limpar tudo
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Items List */}
                    <div className="md:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.product.id}
                                className="group bg-white p-4 rounded-[2rem] shadow-sm border border-gray-50 flex gap-5 transition-all hover:shadow-lg hover:shadow-brand-choco/5 hover:border-brand-pink/10 hover:-translate-y-1 relative overflow-hidden"
                            >
                                {/* Image */}
                                <div className="w-24 h-24 bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden relative shadow-inner">
                                    {getImageUrl(item.product.image_url) ? (
                                        <img src={getImageUrl(item.product.image_url)!} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl bg-brand-cream/30 text-brand-choco/20">🍰</div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-brand-choco text-lg leading-tight mb-1">{item.product.name}</h3>
                                            <p className="text-gray-400 text-xs line-clamp-1">{item.product.description || 'Uma delícia feita com amor'}</p>
                                        </div>
                                        <button
                                            onClick={() => updateQuantity(item.product.id, -item.quantity)} // Remove item
                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                            title="Remover item"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="flex items-end justify-between mt-3">
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, -1)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${item.quantity === 1 ? 'text-red-400 hover:bg-red-50' : 'text-brand-choco hover:bg-white hover:shadow-sm'}`}
                                            >
                                                {item.quantity === 1 ? '🗑️' : '-'}
                                            </button>
                                            <span className="font-bold text-brand-choco w-6 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, 1)}
                                                className="w-8 h-8 rounded-lg text-brand-choco hover:bg-white hover:shadow-sm flex items-center justify-center font-bold text-sm transition-all"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-bold text-brand-pink text-xl">
                                                R$ {(parseFloat(item.product.price) * item.quantity).toFixed(2).replace('.', ',')}
                                            </p>
                                            {item.quantity > 1 && (
                                                <p className="text-[10px] text-gray-400 font-medium">
                                                    R$ {parseFloat(item.product.price).toFixed(2).replace('.', ',')} un
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary / Totals */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-brand-choco/5 border border-gray-50 sticky top-24">
                            <h3 className="font-bold text-brand-choco text-xl mb-6">Resumo do Pedido</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span className="font-medium">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <div className="flex flex-col">
                                        <span>Entrega</span>
                                        <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">Retirada Grátis</span>
                                    </div>
                                    <span className="text-green-500 font-bold">R$ 0,00</span>
                                </div>
                            </div>

                            <div className="my-6 border-t border-dashed border-gray-200"></div>

                            <div className="flex justify-between items-end mb-8">
                                <span className="text-gray-500 font-medium">Total</span>
                                <span className="text-3xl font-bold text-brand-choco">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                            </div>

                            <button
                                onClick={() => {
                                    if (!user) {
                                        toast.error("Entre para continuar", { icon: '🔐' });
                                        router.push('/signin?redirect=/checkout');
                                    } else {
                                        router.push('/checkout');
                                    }
                                }}
                                className="w-full bg-brand-pink text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-pink/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                            >
                                <span>Ir para Pagamento</span>
                                <span className="group-hover:translate-x-1 transition-transform">➜</span>
                            </button>

                            <p className="text-center text-xs text-gray-400 mt-4 leading-normal">
                                O pagamento será realizado apenas na retirada do pedido.
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Bottom Floating Action - Visible only on mobile */}
            <div className="fixed bottom-24 left-4 right-4 md:hidden z-20">
                <button
                    onClick={() => {
                        if (!user) {
                            toast.error("Entre para continuar", { icon: '🔐' });
                            router.push('/signin?redirect=/checkout');
                        } else {
                            router.push('/checkout');
                        }
                    }}
                    className="w-full bg-brand-pink text-white py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-brand-pink/40 flex items-center justify-between px-6 hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/20 backdrop-blur-sm"
                >
                    <span>Ir para pagamento</span>
                    <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </button>
            </div>
        </div>
    );
}
