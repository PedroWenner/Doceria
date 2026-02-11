'use client';

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useLanguage } from '@/app/context/LanguageContext';
import { Loader2, ShoppingBag, DollarSign, Activity, Truck, X, FileText } from 'lucide-react';
import { displayCurrency, displayDate, displayDateTime } from '@/app/utils/formatters';
import ProDatePicker from '@/app/components/ProDatePicker';

export default function OrdersReportView() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    // Default: This Month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        start_date: startOfMonth,
        end_date: endOfMonth,
        status: '',
        payment_status: '',
        delivery_type: ''
    });

    const fetchReport = async () => {
        setLoading(true);
        const token = Cookies.get('auth_token') || Cookies.get('admin_token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

        try {
            const query = new URLSearchParams(filters as any).toString();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/report?${query}`, { headers });
            if (response.ok) {
                const result = await response.json();
                setData(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch orders report", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            start_date: startOfMonth,
            end_date: endOfMonth,
            status: '',
            payment_status: '',
            delivery_type: ''
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Filters Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-end no-print">

                <div className="flex gap-2 w-full xl:w-1/3">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{t('reports.filters.start_date')}</label>
                        <ProDatePicker
                            value={filters.start_date}
                            onChange={(val) => handleFilterChange('start_date', val)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{t('reports.filters.end_date')}</label>
                        <ProDatePicker
                            value={filters.end_date}
                            onChange={(val) => handleFilterChange('end_date', val)}
                        />
                    </div>
                </div>

                <div className="w-full xl:w-48">
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('reports.filters.status')}</label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20"
                    >
                        <option value="">{t('reports.placeholders.select_status')}</option>
                        <option value="pending">{t('orders.pending')}</option>
                        <option value="preparing">{t('orders.preparing')}</option>
                        <option value="ready">{t('orders.ready')}</option>
                        <option value="delivered">{t('orders.delivered')}</option>
                        <option value="canceled">{t('orders.canceled')}</option>
                    </select>
                </div>

                <div className="w-full xl:w-48">
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('reports.filters.payment_method')}</label>
                    <select
                        value={filters.payment_status}
                        onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20"
                    >
                        <option value="">{t('reports.placeholders.select_payment')}</option>
                        <option value="paid">{t('orders.payment_status.paid')}</option>
                        <option value="pending">{t('orders.payment_status.pending')}</option>
                        <option value="failed">{t('orders.payment_status.failed')}</option>
                    </select>
                </div>

                <div className="w-full xl:w-48">
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('reports.filters.delivery_type')}</label>
                    <select
                        value={filters.delivery_type}
                        onChange={(e) => handleFilterChange('delivery_type', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20"
                    >
                        <option value="">{t('reports.placeholders.select_delivery')}</option>
                        <option value="delivery">{t('orders.delivery_type.delivery')}</option>
                        <option value="pickup">{t('orders.delivery_type.pickup')}</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-sm font-medium text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex items-center gap-2"
                    >
                        <X size={16} />
                        {t('reports.filters.clear')}
                    </button>
                </div>
            </div>

            {loading && !data ? (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="animate-spin text-brand-primary" size={40} />
                </div>
            ) : data ? (
                <>
                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('reports.metrics.total_orders')}</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{data.metrics.total_orders}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/30 dark:text-emerald-400">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('reports.metrics.total_revenue')}</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{displayCurrency(data.metrics.total_revenue)}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-violet-100 text-violet-600 rounded-lg dark:bg-violet-900/30 dark:text-violet-400">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('reports.metrics.average_ticket')}</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{displayCurrency(data.metrics.average_ticket)}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg dark:bg-amber-900/30 dark:text-amber-400">
                                <Truck size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('reports.metrics.delivered_orders')}</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{data.metrics.orders_by_status.delivered || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('reports.tabs.orders')} {t('reports.list')}</h3>
                            <button
                                onClick={() => window.print()}
                                disabled={!data || data.orders.length === 0}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed no-print"
                            >
                                <FileText size={16} />
                                {t('reports.actions.generate_pdf')}
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('reports.table.order_id')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('reports.table.date')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('reports.table.customer')}</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('reports.table.items')}</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('reports.table.total')}</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('reports.table.payment')}</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('reports.table.status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data.orders.length > 0 ? (
                                        data.orders.map((order: any) => (
                                            <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                                                    #{order.id}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {displayDateTime(order.created_at)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {order.customer_name}
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-400">
                                                    {order.items?.length || 0}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                    {displayCurrency(order.total_amount)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                        ${order.payment_status === 'paid'
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400'
                                                        }
                                                    `}>
                                                        {order.payment_status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                        ${order.status === 'delivered'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                            : order.status === 'canceled'
                                                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                        }
                                                    `}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                                {t('orders.no_found_matches')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}
