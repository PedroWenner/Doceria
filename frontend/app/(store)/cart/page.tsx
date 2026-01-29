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
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 animate-fadeIn bg-gray-50">
                <div className="relative mb-6">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg shadow-gray-200/50 z-10 relative">
                        <span className="text-5xl grayscale opacity-30">🛒</span>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sua cesta está vazia</h2>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto leading-relaxed text-sm">
                    Nossas vitrines estão cheias de delícias esperando por você.
                </p>
                <Link
                    href="/"
                    className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-gray-900/10"
                >
                    Ver Cardápio
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32 animate-fadeIn">
            <div className="max-w-6xl mx-auto px-4 pt-8">

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sua Cesta <span className="text-gray-400 text-lg ml-2 font-normal">({items.length} itens)</span></h1>
                    <button
                        onClick={clearCart}
                        className="text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                        <span>🗑️</span> Limpar
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Items List */}
                    <div className="md:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.product.id}
                                className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex gap-5 transition-all hover:border-gray-200 relative overflow-hidden"
                            >
                                {/* Image */}
                                <div className="w-24 h-24 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden relative border border-gray-100">
                                    {getImageUrl(item.product.image_url) ? (
                                        <img src={getImageUrl(item.product.image_url)!} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl grayscale opacity-30">🍰</div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{item.product.name}</h3>
                                            <p className="text-gray-400 text-xs line-clamp-1">{item.product.description || 'Uma delícia feita com amor'}</p>
                                        </div>
                                        <button
                                            onClick={() => updateQuantity(item.product.id, -item.quantity)} // Remove item
                                            className="text-gray-300 hover:text-gray-900 transition-colors p-1"
                                            title="Remover item"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="flex items-end justify-between mt-3">
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, -1)}
                                                className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-sm transition-all ${item.quantity === 1 ? 'text-gray-400 hover:text-red-500 hover:bg-white' : 'text-gray-700 hover:bg-white hover:text-gray-900'}`}
                                            >
                                                {item.quantity === 1 ? '🗑️' : '-'}
                                            </button>
                                            <span className="font-bold text-gray-900 w-6 text-center text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, 1)}
                                                className="w-7 h-7 rounded-md text-gray-700 hover:bg-white hover:text-gray-900 flex items-center justify-center font-bold text-sm transition-all"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-lg">
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
                        <div className="bg-white p-6 rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-900 text-lg mb-6 pb-4 border-b border-gray-50">Resumo do Pedido</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-500 text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-medium">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-sm">
                                    <div className="flex flex-col">
                                        <span>Entrega</span>
                                        <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full w-fit mt-0.5">Retirada Grátis</span>
                                    </div>
                                    <span className="text-green-600 font-bold">R$ 0,00</span>
                                </div>
                            </div>

                            <div className="my-6 border-t border-dashed border-gray-200"></div>

                            <div className="flex justify-between items-end mb-8">
                                <span className="text-gray-900 font-bold">Total</span>
                                <span className="text-2xl font-extrabold text-gray-900">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
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
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-base shadow-xl shadow-gray-900/10 flex items-center justify-center gap-3 hover:bg-black active:scale-[0.98] transition-all group"
                            >
                                <span>Ir para Pagamento</span>
                                <span className="group-hover:translate-x-1 transition-transform">➜</span>
                            </button>

                            <p className="text-center text-[10px] text-gray-400 mt-4 leading-normal">
                                O pagamento será realizado apenas na retirada.
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Bottom Floating Action */}
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
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-base shadow-2xl shadow-gray-900/30 flex items-center justify-between px-6 hover:bg-black active:scale-[0.98] transition-all border border-white/10"
                >
                    <span>Ir para pagamento</span>
                    <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </button>
            </div>
        </div>
    );
}
