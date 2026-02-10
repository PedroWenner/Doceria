'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { useLanguage } from '@/app/context/LanguageContext';
import { displayCurrency } from '@/app/utils/formatters';

interface DataPoint {
    name: string; // Month name
    revenue: number;
    expenses: number;
    profit: number;
}

interface Props {
    data: DataPoint[];
}

export default function FinancialOverviewChart({ data }: Props) {
    const { t } = useLanguage();

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-xl">
                    <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm mb-1">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="capitalize text-slate-600 dark:text-slate-400">
                                {entry.name === 'revenue' ? t('financial.revenue') :
                                    entry.name === 'expenses' ? t('financial.expenses') :
                                        t('financial.profit')}:
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                                {displayCurrency(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => `R$ ${value / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        name="revenue" // keys for translation lookup
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="expenses"
                        name="expenses"
                        stroke="#ef4444"
                        fillOpacity={1}
                        fill="url(#colorExpenses)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
