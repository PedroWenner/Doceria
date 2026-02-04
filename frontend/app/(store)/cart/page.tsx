'use client';

import { useCart } from '@/app/context/CartContext';
import { useStoreAuth } from '@/app/context/StoreAuthContext'; // Updated import
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { user } = useStoreAuth(); // Use store auth
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
        <div className="min-h-screen pb-32 animate-fadeIn transition-colors duration-500" style={{ backgroundColor: 'var(--store-bg)' }}>
            <div className="max-w-6xl mx-auto px-4 pt-8">

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--store-text)' }}>Sua Cesta <span className="text-lg ml-2 font-normal" style={{ color: 'var(--store-text-muted)' }}>({items.length} itens)</span></h1>
                    <button
                        onClick={clearCart}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 hover:text-red-500 hover:bg-red-50"
                        style={{ color: 'var(--store-text-muted)' }}
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
                                className="group p-5 rounded-xl shadow-sm border flex gap-5 transition-all relative overflow-hidden"
                                style={{
                                    backgroundColor: 'var(--store-card)',
                                    borderColor: 'var(--store-border)',
                                }}
                            >
                                {/* Image */}
                                <div className="w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden relative border"
                                    style={{
                                        backgroundColor: 'var(--store-bg)',
                                        borderColor: 'var(--store-border)'
                                    }}>
                                    {getImageUrl(item.product.image_path) ? (
                                        <img src={getImageUrl(item.product.image_path)!} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl grayscale opacity-30">🍰</div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight mb-1" style={{ color: 'var(--store-text)' }}>{item.product.name}</h3>
                                            <p className="text-xs line-clamp-1" style={{ color: 'var(--store-text-muted)' }}>{item.product.description || 'Uma delícia feita com amor'}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.product.id)} // Remove item
                                            className="transition-colors p-1 hover:opacity-100 opacity-60"
                                            style={{ color: 'var(--store-text)' }}
                                            title="Remover item"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="flex items-end justify-between mt-3">
                                        <div className="flex items-center gap-3 rounded-lg p-1 border"
                                            style={{
                                                backgroundColor: 'var(--store-bg)',
                                                borderColor: 'var(--store-border)'
                                            }}>
                                            <button
                                                onClick={() => item.quantity === 1 ? removeFromCart(item.product.id) : updateQuantity(item.product.id, -1)}
                                                className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-sm transition-all hover:bg-white hover:text-red-500`}
                                                style={{ color: item.quantity === 1 ? 'var(--store-text-muted)' : 'var(--store-text)' }}
                                            >
                                                {item.quantity === 1 ? '🗑️' : '-'}
                                            </button>
                                            <span className="font-bold w-6 text-center text-sm" style={{ color: 'var(--store-text)' }}>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, 1)}
                                                className="w-7 h-7 rounded-md hover:bg-white flex items-center justify-center font-bold text-sm transition-all"
                                                style={{ color: 'var(--store-text)' }}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-bold text-lg" style={{ color: 'var(--store-text)' }}>
                                                R$ {(parseFloat(item.product.price) * item.quantity).toFixed(2).replace('.', ',')}
                                            </p>
                                            {item.quantity > 1 && (
                                                <p className="text-[10px] font-medium" style={{ color: 'var(--store-text-muted)' }}>
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
                        <div className="p-6 rounded-xl shadow-lg border sticky top-24"
                            style={{
                                backgroundColor: 'var(--store-card)',
                                borderColor: 'var(--store-border)',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}>
                            <h3 className="font-bold text-lg mb-6 pb-4 border-b" style={{ color: 'var(--store-text)', borderColor: 'var(--store-border)' }}>Resumo do Pedido</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm" style={{ color: 'var(--store-text-muted)' }}>
                                    <span>Subtotal</span>
                                    <span className="font-medium">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-sm" style={{ color: 'var(--store-text-muted)' }}>
                                    <div className="flex flex-col">
                                        <span>Entrega</span>
                                        <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full w-fit mt-0.5"
                                            style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'rgb(21, 128, 61)' }}>Retirada Grátis</span>
                                    </div>
                                    <span className="font-bold" style={{ color: 'rgb(22, 163, 74)' }}>R$ 0,00</span>
                                </div>
                            </div>

                            <div className="my-6 border-t border-dashed" style={{ borderColor: 'var(--store-border)' }}></div>

                            <div className="flex justify-between items-end mb-8">
                                <span className="font-bold" style={{ color: 'var(--store-text)' }}>Total</span>
                                <span className="text-2xl font-extrabold" style={{ color: 'var(--store-text)' }}>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
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
                                className="w-full py-4 rounded-xl font-bold text-base shadow-xl flex items-center justify-center gap-3 transition-all hover:opacity-90 active:scale-[0.98] group"
                                style={{
                                    backgroundColor: 'var(--store-primary)',
                                    color: 'var(--store-primary-fg)',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <span>Ir para Pagamento</span>
                                <span className="group-hover:translate-x-1 transition-transform">➜</span>
                            </button>

                            <p className="text-center text-[10px] mt-4 leading-normal" style={{ color: 'var(--store-text-muted)' }}>
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
                    className="w-full py-4 rounded-xl font-bold text-base shadow-2xl flex items-center justify-between px-6 transition-all border border-white/10"
                    style={{
                        backgroundColor: 'var(--store-primary)',
                        color: 'var(--store-primary-fg)',
                    }}
                >
                    <span>Ir para pagamento</span>
                    <span className="px-3 py-1 rounded-lg text-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </button>
            </div>
        </div>
    );
}
