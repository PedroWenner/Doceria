'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { useEffect, Suspense } from 'react';

function PendingContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const { clearCart } = useCart();

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-pulse">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6 text-4xl">
                ⏳
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Pagamento em Processamento</h1>
            <p className="text-slate-500 mb-8 max-w-md">
                Estamos aguardando a confirmação do pagamento para o pedido #{orderId}.
                Assim que confirmado, você será notificado.
            </p>
            <div className="flex gap-4">
                <Link
                    href="/orders/my"
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg"
                >
                    Acompanhar Pedido
                </Link>
            </div>
        </div>
    );
}

export default function CheckoutPendingPage() {
    return (
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Carregando...</div>}>
            <PendingContent />
        </Suspense>
    );
}
