'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import confetti from 'canvas-confetti';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const { clearCart } = useCart();

    useEffect(() => {
        clearCart();
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, [clearCart]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-4xl">
                ✅
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Pagamento Aprovado!</h1>
            <p className="text-slate-500 mb-8 max-w-md">
                Seu pedido #{orderId} foi confirmado e já estamos preparando suas delícias.
            </p>
            <div className="flex gap-4">
                <Link
                    href="/orders/my"
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg"
                >
                    Ver Meus Pedidos
                </Link>
                <Link
                    href="/"
                    className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                    Voltar para Loja
                </Link>
            </div>
        </div>
    );
}
