'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/StoreAuthContext';
import { CheckCircle2, XCircle, AlertCircle, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

function StatusContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { token } = useAuth();

    // MP Params: payment_id, status, external_reference, preference_id
    const paymentId = searchParams.get('payment_id');
    const mpStatus = searchParams.get('status');
    const orderId = searchParams.get('external_reference');

    const [verifying, setVerifying] = useState(true);
    const [finalStatus, setFinalStatus] = useState<'paid' | 'pending' | 'failed' | 'canceled' | null>(null);

    useEffect(() => {
        if (!paymentId || !orderId) {
            // Fallback if accessed without params (maybe direct link or error)
            if (mpStatus === 'rejected') setFinalStatus('failed');
            else if (mpStatus === 'pending') setFinalStatus('pending');
            else if (mpStatus === 'approved') setFinalStatus('paid');
            else setVerifying(false);
            return;
        }

        const verifyPayment = async () => {
            try {
                // If we don't have a token (user not logged in?), we might fail.
                // But checkout usually requires login.
                // Assuming token is available.

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/verify-payment?payment_id=${paymentId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setFinalStatus(data.data.order_status); // or data.data.payment_status mapped
                } else {
                    console.error('Verification failed');
                    // Fallback to MP param
                    setFinalStatus(mpStatus === 'approved' ? 'paid' : 'failed');
                }
            } catch (error) {
                console.error(error);
                setFinalStatus(mpStatus === 'approved' ? 'paid' : 'failed');
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [paymentId, orderId, mpStatus, token]);

    if (verifying) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Verificando Pagamento...</h2>
                <p className="text-slate-500">Aguarde enquanto confirmamos com o banco.</p>
            </div>
        );
    }

    if (finalStatus === 'paid') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                    <CheckCircle2 size={48} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Pagamento Confirmado! 🎉</h1>
                <p className="text-slate-600 max-w-md mx-auto mb-8">
                    Seu pedido <strong>#{orderId}</strong> foi recebido e já estamos preparando suas delícias.
                </p>
                <div className="flex gap-4">
                    <Link href="/profile" className="px-6 py-3 bg-slate-100 text-slate-900 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                        Meus Pedidos
                    </Link>
                    <Link href="/" className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                        Voltar à Loja
                    </Link>
                </div>
            </div>
        );
    }

    if (finalStatus === 'pending') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6 text-yellow-600">
                    <AlertCircle size={48} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Pagamento em Análise ⏳</h1>
                <p className="text-slate-600 max-w-md mx-auto mb-8">
                    Estamos aguardando a confirmação do pagamento. Isso pode levar alguns minutos (especialmente Pix ou Boleto).
                </p>
                <div className="flex gap-4">
                    <Link href="/profile" className="px-6 py-3 bg-slate-100 text-slate-900 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                        Acompanhar Status
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
                <XCircle size={48} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Pagamento não Concluído 😢</h1>
            <p className="text-slate-600 max-w-md mx-auto mb-8">
                Houve um problema ao processar seu pagamento. Nenhuma cobrança foi feita.
            </p>
            <div className="flex gap-4">
                <Link href="/checkout" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg">
                    Tentar Novamente
                </Link>
            </div>
        </div>
    );
}

export default function PaymentStatusPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <StatusContent />
        </Suspense>
    );
}
