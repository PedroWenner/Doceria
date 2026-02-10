'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import Cookies from 'js-cookie';
import FinancialOverviewChart from './FinancialOverviewChart';
import PaymentStatusChart from './PaymentStatusChart';
import ExpensesCategoryChart from './ExpensesCategoryChart';
import { Loader2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { displayCurrency } from '@/app/utils/formatters';


import TopProductsWidget from './TopProductsWidget';
import LowStockWidget from './LowStockWidget';

export default function FinancialDashboard() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 5)).toISOString().split('T')[0], // Last 6 months
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchData = async () => {
            const token = Cookies.get('auth_token');
            try {
                const token = Cookies.get('auth_token') || Cookies.get('admin_token');

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/financial-summary?start_date=${dateRange.start}&end_date=${dateRange.end}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                const jsonData = await response.json();
                if (jsonData.status === 'success') {
                    setData(jsonData.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (!data) return null;

    const totalRevenue = data.overview.reduce((acc: number, curr: any) => acc + Number(curr.revenue), 0);
    const totalExpenses = data.overview.reduce((acc: number, curr: any) => acc + Number(curr.expenses), 0);
    const totalProfit = totalRevenue - totalExpenses;

    const chartData = data.overview;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header / Title */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {t('financial.dashboard_title')}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('financial.dashboard_subtitle')}
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={48} className="text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('financial.total_revenue')}</p>
                    <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{displayCurrency(totalRevenue)}</h3>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingDown size={48} className="text-red-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('financial.total_expenses')}</p>
                    <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">{displayCurrency(totalExpenses)}</h3>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={48} className="text-blue-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('financial.net_profit')}</p>
                    <h3 className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                        {displayCurrency(totalProfit)}
                    </h3>
                </div>
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Evolution Chart (Wider) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-500" />
                        {t('financial.revenue_vs_expenses')}
                    </h3>
                    <FinancialOverviewChart data={chartData} />
                </div>

                {/* Payment Status */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">
                        {t('financial.payment_status')}
                    </h3>
                    <PaymentStatusChart data={data.payment_status} />
                </div>
            </div>

            {/* Secondary Widgets Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Expenses Categories */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">
                        {t('financial.top_expenses')}
                    </h3>
                    <ExpensesCategoryChart data={data.expenses_by_category} />
                </div>

                {/* Top Products Widget */}
                <TopProductsWidget data={data.top_products} />

                {/* Low Stock Alert Widget (Only if enabled) */}
                {data.settings?.enable_stock_control && (
                    <LowStockWidget data={data.low_stock} />
                )}
            </div>
        </div>
    );
}
