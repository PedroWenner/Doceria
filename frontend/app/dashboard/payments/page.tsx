'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { Wallet } from 'lucide-react';

import PaymentTable from '@/app/components/payments/PaymentTable';
import PaymentFilterBar from '@/app/components/payments/PaymentFilterBar';
import NewPaymentModal from '@/app/components/payments/NewPaymentModal';
import Pagination from '@/app/components/Pagination';

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination Meta
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });

    // Filters State
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        method: 'all',
        date_from: '',
        date_to: ''
    });

    const token = Cookies.get('admin_token');

    const fetchPayments = async (page = 1) => {
        if (!token) return;
        setLoading(true);

        try {
            // Build Query Params
            const params = new URLSearchParams();
            params.append('page', page.toString());
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
                setPayments(data.data.data);
                setMeta({
                    current_page: data.data.current_page,
                    last_page: data.data.last_page,
                    total: data.data.total,
                    per_page: data.data.per_page
                });
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
            fetchPayments(1);
        }, 500);
        return () => clearTimeout(timeout);
    }, [filters]);

    // Update handlers
    const handleSearch = (val: string) => setFilters(prev => ({ ...prev, search: val }));
    const handleStatus = (val: string) => setFilters(prev => ({ ...prev, status: val }));
    const handleMethod = (val: string) => setFilters(prev => ({ ...prev, method: val }));

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6 md:p-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Wallet className="text-slate-400" />
                    Pagamentos
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 ml-8">
                    Gestão financeira e histórico de transações.
                </p>
            </div>

            {/* Filters */}
            <PaymentFilterBar
                search={filters.search}
                onSearch={handleSearch}
                status={filters.status}
                onStatusChange={handleStatus}
                method={filters.method}
                onMethodChange={handleMethod}
                dateFrom={filters.date_from}
                onDateFromChange={(val) => setFilters(prev => ({ ...prev, date_from: val }))}
                dateTo={filters.date_to}
                onDateToChange={(val) => setFilters(prev => ({ ...prev, date_to: val }))}
                onNewPayment={() => setIsModalOpen(true)}
            />

            {/* Table & Pagination */}
            <div className="space-y-4">
                <PaymentTable payments={payments} isLoading={loading} />

                {!loading && (
                    <Pagination
                        currentPage={meta.current_page}
                        lastPage={meta.last_page}
                        total={meta.total}
                        perPage={meta.per_page}
                        onPageChange={fetchPayments}
                    />
                )}
            </div>

            {/* Modal */}
            <NewPaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchPayments(1)}
                token={token}
            />
        </div>
    );
}
