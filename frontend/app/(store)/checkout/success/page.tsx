'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import confetti from 'canvas-confetti';
import jsCookie from 'js-cookie';
import { toast } from 'react-hot-toast';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const { clearCart } = useCart();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            clearCart();

            // Fetch Order Details
            const fetchOrder = async () => {
                try {
                    const token = jsCookie.get('store_token');
                    const headers: any = { 'Accept': 'application/json' };
                    if (token) headers['Authorization'] = `Bearer ${token}`;

                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/orders/${orderId}`, {
                        headers,
                        cache: 'no-store'
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setOrder(data.data);

                        if (data.data.payment_status === 'paid') {
                            confetti({
                                particleCount: 100,
                                spread: 70,
                                origin: { y: 0.6 }
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error fetching order", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchOrder();
        }
    }, [orderId, clearCart]);

    const handleCopyPix = () => {
        const qrCode = order?.payment_metadata?.qr_code || order?.payment_metadata?.transaction_data?.qr_code;
        if (qrCode) {
            navigator.clipboard.writeText(qrCode);
            toast.success("Código Pix copiado!");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    // Check if it's Pix and Pending
    const isPixPending = order && (order.payment_status === 'pending') &&
        (order.payment_method?.toLowerCase().includes('pix'));

    if (isPixPending) {
        const qrCode = order?.payment_metadata?.qr_code || order?.payment_metadata?.transaction_data?.qr_code;
        const qrCodeBase64 = order?.payment_metadata?.qr_code_base64 || order?.payment_metadata?.transaction_data?.qr_code_base64;

        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-fadeIn max-w-lg mx-auto">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-3xl">
                    💠
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Pagamento Pix Gerado!</h1>
                <p className="text-slate-500 mb-8 text-sm">
                    Escaneie o QR Code ou copie o código abaixo para finalizar seu pagamento.
                </p>

                {/* QR Code Image */}
                {qrCodeBase64 ? (
                    <div className="mb-6 p-4 bg-white border rounded-xl shadow-sm">
                        <img
                            src={`data:image/jpeg;base64,${qrCodeBase64}`}
                            alt="QR Code Pix"
                            className="w-48 h-48 object-contain"
                        />
                    </div>
                ) : (
                    <div className="mb-6 p-8 bg-gray-50 border rounded-xl text-xs text-gray-400">
                        QR Code imagem indisponível
                    </div>
                )}

                {/* Copy Paste Code */}
                {qrCode ? (
                    <div className="w-full mb-8">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block text-left">Código Pix Copia e Cola</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={qrCode}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 truncate font-mono"
                            />
                            <button
                                onClick={handleCopyPix}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Copiar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full mb-8 p-4 bg-red-50 border border-red-100 rounded-lg text-left">
                        <p className="text-xs font-bold text-red-600 mb-1">Erro ao carregar código Pix</p>
                        <pre className="text-[10px] text-red-500 overflow-auto max-h-20">
                            {JSON.stringify(order.payment_metadata, null, 2)}
                        </pre>
                    </div>
                )}

                <p className="text-xs text-slate-400 mb-8 bg-blue-50 p-3 rounded-lg text-blue-800 border border-blue-100">
                    Após o pagamento, seu pedido será atualizado automaticamente em alguns instantes.
                </p>

                <div className="flex gap-4">
                    <Link
                        href="/orders"
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm"
                    >
                        Ver Meus Pedidos
                    </Link>
                </div>
            </div>
        );
    }

    // Success / Default View
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-4xl">
                ✅
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Pedido Recebido!</h1>
            <p className="text-slate-500 mb-8 max-w-md">
                Seu pedido #{orderId} foi registrado com sucesso.
                {order?.payment_status === 'paid' && <span className="block mt-1 font-medium text-green-600">Pagamento confirmado! Estamos preparando. 🧁</span>}
            </p>
            <div className="flex gap-4">
                <Link
                    href="/orders"
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
