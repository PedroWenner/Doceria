'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import Cookies from 'js-cookie';
import { Loader2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import DateRangeControls from './DateRangeControls';
import ComparisonSummary from './ComparisonSummary';
import RevenueComparisonChart from './RevenueComparisonChart';

export default function ReportsPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

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

            const query = new URLSearchParams({
                start_date: dateRange.start,
                end_date: dateRange.end,
                compare_start_date: compareRange.start,
                compare_end_date: compareRange.end
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/financial-reports?${query.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setData(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []); // Initial load

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Advanced Financial Reports
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Compare performance across different periods.
                </p>
            </div>

            {/* Controls */}
            <DateRangeControls
                startDate={dateRange.start}
                endDate={dateRange.end}
                compareStartDate={compareRange.start}
                compareEndDate={compareRange.end}
                onDateChange={(start, end) => setDateRange({ start, end })}
                onCompareDateChange={(start, end) => setCompareRange({ start, end })}
                onRefresh={fetchReports}
            />

            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="animate-spin text-brand-primary" size={40} />
                </div>
            ) : data ? (
                <>
                    {/* Summary Cards */}
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

                    {/* Charts */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">
                            Revenue Comparison (Daily)
                        </h3>
                        <RevenueComparisonChart
                            primaryData={data.primary.chart_data}
                            comparisonData={data.comparison?.chart_data}
                        />
                    </div>
                </>
            ) : null}
        </div>
    );
}
