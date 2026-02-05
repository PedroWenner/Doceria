'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { Wallet, CreditCard, ArrowUpRight } from 'lucide-react';

import PaymentTable from '@/app/components/payments/PaymentTable';
import PaymentFilterBar from '@/app/components/payments/PaymentFilterBar';
import NewPaymentModal from '@/app/components/payments/NewPaymentModal';

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filters State
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        method: 'all',
        date_from: '',
        date_to: ''
    });

    const token = Cookies.get('admin_token');

    const fetchPayments = async () => {
        if (!token) return;
        setLoading(true);

        try {
            // Build Query Params
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.status !== 'all') params.append('status', filters.status);
            if (filters.method !== 'all') params.append('method', filters.method);
            if (filters.date_from) params.append('date_from', filters.date_from);
            if (filters.date_to) params.append('date_to', filters.date_to);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (data.status === 'success') {
                setPayments(data.data.data); // data.data because of pagination wrapper
            }
        } catch (error) {
            console.error('Failed to fetch payments', error);
            toast.error('Erro ao carregar pagamentos');
        } finally {
            setLoading(false);
        }
    };

    // Debounce Search
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchPayments();
        }, 500);
        return () => clearTimeout(timeout);
    }, [filters]);

    // Update handlers
    const handleSearch = (val: string) => setFilters(prev => ({ ...prev, search: val }));
    const handleStatus = (val: string) => setFilters(prev => ({ ...prev, status: val }));
    const handleMethod = (val: string) => setFilters(prev => ({ ...prev, method: val }));
    const handleDate = (start: string, end: string) => setFilters(prev => ({ ...prev, date_from: start, date_to: end }));

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 pb-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-3">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-sm">
                                <Wallet size={32} />
                            </div>
                            Gestão de Pagamentos
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm ml-[72px] max-w-lg">
                            Visualize, filtre e gerencie todas as transações financeiras do sistema de forma centralizada.
                        </p>
                    </div>

                    {/* Quick Stats (Stub) */}
                    <div className="flex gap-4">
                        <div className="px-5 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                                <CreditCard size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hoje</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">R$ --,--</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <PaymentFilterBar
                    onSearch={handleSearch}
                    onStatusChange={handleStatus}
                    onMethodChange={handleMethod}
                    onDateChange={handleDate}
                    onNewPayment={() => setIsModalOpen(true)}
                />

                {/* Table */}
                <PaymentTable payments={payments} isLoading={loading} />

                {/* Modal */}
                <NewPaymentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchPayments}
                    token={token}
                />
            </div>
        </div>
    );
}
