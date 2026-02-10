'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '@/app/context/LanguageContext';
import { displayCurrency } from '@/app/utils/formatters';

interface DataPoint {
    name: string;
    total: number;
    color: string;
}

interface Props {
    data: DataPoint[];
}

export default function ExpensesCategoryChart({ data }: Props) {
    // Sort by total desc and take top 5 to avoid clutter
    const sortedData = [...data].sort((a, b) => b.total - a.total).slice(0, 5);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-xl">
                    <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{data.name}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {displayCurrency(data.total)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={sortedData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                        {sortedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#cbd5e1'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
