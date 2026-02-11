'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import Cookies from 'js-cookie';
import { Loader2, TrendingUp, TrendingDown, DollarSign, List, PieChart } from 'lucide-react';
import DateRangeControls from './DateRangeControls';
import ComparisonSummary from './ComparisonSummary';
import RevenueComparisonChart from './RevenueComparisonChart';
import DetailedReportTable from './DetailedReportTable';
import ReportWidgets from './ReportWidgets';
import ReportFilters from './ReportFilters';

export default function FinancialReportView() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [transactions, setTransactions] = useState([]);
    const [widgetsData, setWidgetsData] = useState<any>(null);

    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [groupBy, setGroupBy] = useState<'day' | 'month' | 'year'>('day');
    const [activeTab, setActiveTab] = useState<'transactions' | 'insights'>('insights');

    // Filters State
    const [filters, setFilters] = useState({
        type: '',
        category_id: '',
        payment_method_id: ''
    });

    // Default: This Month vs Last Month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const [dateRange, setDateRange] = useState({
        start: startOfMonth.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0]
    });

    const [compareRange, setCompareRange] = useState({
        start: prevMonthStart.toISOString().split('T')[0],
        end: prevMonthEnd.toISOString().split('T')[0]
    });

    const fetchReports = async () => {
        try {
            setLoading(true);
            const token = Cookies.get('auth_token') || Cookies.get('admin_token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            };

            const query = new URLSearchParams({
                start_date: dateRange.start,
                end_date: dateRange.end,
                compare_start_date: compareRange.start,
                compare_end_date: compareRange.end,
                group_by: groupBy
            });

            // 1. Fetch Main Summary & Charts
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/financial-reports?${query.toString()}`, { headers });
            if (response.ok) {
                const result = await response.json();
                setData(result.data);
            }

            setLoadingTransactions(true);
            const txQuery = new URLSearchParams({
                start_date: dateRange.start,
                end_date: dateRange.end,
                type: filters.type,
                category_id: filters.category_id,
                payment_method_id: filters.payment_method_id
            });

            // 2. Fetch Transactions (Detailed Table)
            const txResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/financial-transactions?${txQuery.toString()}`, { headers });
            if (txResponse.ok) {
                const txResult = await txResponse.json();
                setTransactions(txResult.data);
            }

            // 3. Fetch Widgets
            const widgetsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/financial-report-widgets?${txQuery.toString()}`, { headers });
            if (widgetsResponse.ok) {
                const widgetsResult = await widgetsResponse.json();
                setWidgetsData(widgetsResult.data);
            }

        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
            setLoadingTransactions(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [groupBy, dateRange, compareRange, filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ type: '', category_id: '', payment_method_id: '' });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    {/* Header might be redundant if the parent handles it, but keeping it for now or we can remove "sidebar.reports" title if the parent has it */}
                    {/* Granularity Selector moved inside here for now */}
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    {(['day', 'month', 'year'] as const).map((view) => (
                        <button
                            key={view}
                            onClick={() => setGroupBy(view)}
                            className={`
                                px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize
                                ${groupBy === view
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }
                            `}
                        >
                            {view}
                        </button>
                    ))}
                </div>
            </div>

            <DateRangeControls
                startDate={dateRange.start}
                endDate={dateRange.end}
                compareStartDate={compareRange.start}
                compareEndDate={compareRange.end}
                onDateChange={(start, end) => setDateRange({ start, end })}
                onCompareDateChange={(start, end) => setCompareRange({ start, end })}
                onRefresh={fetchReports}
            />

            <ReportFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={clearFilters}
            />

            {loading && !data ? (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="animate-spin text-brand-primary" size={40} />
                </div>
            ) : data ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ComparisonSummary
                            title="Total Revenue"
                            primaryValue={Number(data.primary.totals.revenue)}
                            comparisonValue={Number(data.comparison?.totals.revenue || 0)}
                            icon={<TrendingUp size={24} />}
                            colorClass="text-emerald-600 dark:text-emerald-400"
                        />
                        <ComparisonSummary
                            title="Total Expenses"
                            primaryValue={Number(data.primary.totals.expenses)}
                            comparisonValue={Number(data.comparison?.totals.expenses || 0)}
                            icon={<TrendingDown size={24} />}
                            colorClass="text-rose-600 dark:text-rose-400"
                            invertTrend
                        />
                        <ComparisonSummary
                            title="Net Profit"
                            primaryValue={Number(data.primary.totals.profit)}
                            comparisonValue={Number(data.comparison?.totals.profit || 0)}
                            icon={<DollarSign size={24} />}
                            colorClass="text-blue-600 dark:text-blue-400"
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 capitalize">
                            Revenue Comparison ({groupBy})
                        </h3>
                        <RevenueComparisonChart
                            primaryData={data.primary.chart_data}
                            comparisonData={data.comparison?.chart_data}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => setActiveTab('insights')}
                                className={`pb-3 px-2 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'insights' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                            >
                                <PieChart size={18} />
                                Insights & Widgets
                            </button>
                            <button
                                onClick={() => setActiveTab('transactions')}
                                className={`pb-3 px-2 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'transactions' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                            >
                                <List size={18} />
                                Detailed Transactions
                            </button>
                        </div>

                        {activeTab === 'insights' && (
                            <ReportWidgets data={widgetsData} isLoading={loadingTransactions} />
                        )}

                        {activeTab === 'transactions' && (
                            <DetailedReportTable
                                data={transactions}
                                isLoading={loadingTransactions}
                            />
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
}
