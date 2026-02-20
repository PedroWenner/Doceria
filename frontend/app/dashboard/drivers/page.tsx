'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { Truck } from 'lucide-react';

import { useLanguage } from '@/app/context/LanguageContext';
import DriverFilterBar from '@/app/components/drivers/DriverFilterBar';
import DriverTable from '@/app/components/drivers/DriverTable';
import DriverModal from '@/app/components/drivers/DriverModal';
import Pagination from '@/app/components/Pagination';

export default function DriversPage() {
    const { t } = useLanguage();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination Meta
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });

    // Filters State
    const [filters, setFilters] = useState({
        search: '',
        status: 'all'
    });

    const token = Cookies.get('admin_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    const fetchDrivers = async (page = 1) => {
        if (!token) return;
        setLoading(true);

        try {
            // Build Query Params
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('per_page', '15');
            if (filters.search) params.append('search', filters.search);
            if (filters.status !== 'all') params.append('status', filters.status);

            const res = await fetch(`${apiUrl}/drivers?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const response = await res.json();

            if (res.ok && response.status === 'success') {
                setDrivers(response.data.data);
                setMeta({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    per_page: response.data.per_page
                });
            } else {
                if (res.status === 403) {
                    toast.error('Acesso negado: Verifique o contrato de logística.');
                } else {
                    toast.error(response.message || 'Erro ao carregar motoristas');
                }
            }
        } catch (error) {
            console.error('Failed to fetch drivers', error);
            toast.error('Erro de conexão ao carregar motoristas.');
        } finally {
            setLoading(false);
        }
    };

    // Debounce Search
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchDrivers(1);
        }, 500);
        return () => clearTimeout(timeout);
    }, [filters, token]); // Re-fetch when filters change

    const handleSearch = (val: string) => setFilters(prev => ({ ...prev, search: val }));
    const handleStatus = (val: string) => setFilters(prev => ({ ...prev, status: val }));

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6 md:p-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Truck className="text-slate-400" />
                    {t('drivers.title')}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 ml-8">
                    {t('drivers.subtitle')}
                </p>
            </div>

            {/* Filters */}
            <DriverFilterBar
                search={filters.search}
                onSearch={handleSearch}
                status={filters.status}
                onStatusChange={handleStatus}
                onNewDriver={() => setIsModalOpen(true)}
            />

            {/* Table & Pagination */}
            <div className="space-y-4">
                <DriverTable
                    drivers={drivers}
                    isLoading={loading}
                />

                {!loading && meta.total > 0 && (
                    <Pagination
                        currentPage={meta.current_page}
                        lastPage={meta.last_page}
                        total={meta.total}
                        perPage={meta.per_page}
                        onPageChange={fetchDrivers}
                    />
                )}
            </div>

            {/* Modal */}
            <DriverModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchDrivers(1)}
                token={token}
            />
        </div>
    );
}
