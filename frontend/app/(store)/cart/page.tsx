'use client';

import { useCart } from '@/app/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [apiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');

    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${apiUrl.replace('/api', '')}/storage/${path}`;
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fadeIn">
                <div className="w-40 h-40 bg-brand-pink/10 rounded-full flex items-center justify-center mb-6 animate-float">
                    <span className="text-6xl grayscale opacity-50">🛒</span>
                </div>
                <h2 className="text-2xl font-bold text-brand-choco mb-2">Sua cesta está vazia</h2>
                <p className="text-gray-400 mb-8 max-w-xs mx-auto">Parece que você ainda não escolheu suas gostosuras.</p>
                <Link
                    href="/"
                    className="px-8 py-4 bg-brand-pink text-white rounded-full font-bold shadow-lg shadow-brand-pink/30 hover:shadow-brand-pink/50 hover:scale-105 transition-all"
                >
                    Voltar para o Cardápio
                </Link>
            </div>
        );
    }

    return (
        <div className="pb-32 animate-fadeIn space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-brand-choco">Sua Cesta</h1>
                <button
                    onClick={clearCart}
                    className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors"
                >
                    Limpar tudo
                </button>
            </div>

            <div className="space-y-4">
                {items.map((item) => (
                    <div
                        key={item.product.id}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex gap-4 transition-all hover:border-brand-pink/20"
                    >
                        {/* Image */}
                        <div className="w-20 h-20 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden">
                            {getImageUrl(item.product.image_url) ? (
                                <img src={getImageUrl(item.product.image_url)!} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl bg-brand-cream/30 text-brand-choco/20">🍰</div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-brand-choco line-clamp-1 text-sm">{item.product.name}</h3>
                                <div className="text-right">
                                    <p className="font-bold text-brand-pink text-sm">
                                        R$ {(parseFloat(item.product.price) * item.quantity).toFixed(2).replace('.', ',')}
                                    </p>
                                    {item.quantity > 1 && (
                                        <p className="text-[10px] text-gray-400">
                                            R$ {parseFloat(item.product.price).toFixed(2).replace('.', ',')} un
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                {/* Quantity Control */}
                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                    <button
                                        onClick={() => updateQuantity(item.product.id, -1)}
                                        className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-sm transition-colors ${item.quantity === 1 ? 'text-red-400 bg-white shadow-sm' : 'text-brand-choco hover:bg-white hover:shadow-sm'}`}
                                    >
                                        {item.quantity === 1 ? '🗑️' : '-'}
                                    </button>
                                    <span className="font-bold text-brand-choco text-sm min-w-[20px] text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.product.id, 1)}
                                        className="w-7 h-7 rounded-md text-brand-choco hover:bg-white hover:shadow-sm flex items-center justify-center font-bold text-sm transition-colors"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Remove Button (Optional if -1 does it) */}
                                {/* <button onClick={() => removeFromCart(item.product.id)} className="text-gray-300 hover:text-red-400 text-xs">
                                    Remover
                                </button> */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Resume / Totals */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 space-y-3">
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Taxa de entrega</span>
                    <span className="text-green-500 font-bold">Grátis</span>
                </div>
                <div className="h-px bg-gray-100 my-2"></div>
                <div className="flex justify-between text-lg font-bold text-brand-choco">
                    <span>Total</span>
                    <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>

            {/* Bottom Floating Action */}
            <div className="fixed bottom-20 md:bottom-8 left-0 right-0 px-4 md:px-0 max-w-5xl mx-auto z-20">
                <button
                    onClick={() => toast.success("Indo para checkout...")}
                    className="w-full bg-brand-pink text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-pink/30 flex items-center justify-between px-6 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <span>Ir para pagamento</span>
                    <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </button>
            </div>

            {/* Safe area spacer for bottom nav */}
            <div className="h-12"></div>
        </div>
    );
}

// Only simple toast stub for now, need import from hot-toast if using it
import { toast } from 'react-hot-toast';
