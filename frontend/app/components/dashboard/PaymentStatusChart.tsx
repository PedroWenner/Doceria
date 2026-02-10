'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLanguage } from '@/app/context/LanguageContext';
import { displayCurrency } from '@/app/utils/formatters';

interface DataPoint {
    payment_status: string;
    count: number;
    total: number;
}

interface Props {
    data: DataPoint[];
}

const COLORS = {
    paid: '#10b981', // emerald-500
    pending: '#f59e0b', // amber-500
    failed: '#ef4444', // red-500
    canceled: '#94a3b8' // slate-400
};

export default function PaymentStatusChart({ data }: Props) {
    const { t } = useLanguage();

    const chartData = data.map(item => ({
        name: item.payment_status,
        value: item.count,
        total: item.total,
        color: COLORS[item.payment_status as keyof typeof COLORS] || '#cbd5e1'
    }));

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;

            const getLabel = (status: string) => {
                switch (status) {
                    case 'paid': return t('financial.paid');
                    case 'pending': return t('financial.pending');
                    case 'failed': return t('financial.failed');
                    case 'canceled': return t('financial.canceled');
                    default: return status;
                }
            };

            return (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-xl">
                    <p className="font-bold capitalize text-slate-700 dark:text-slate-200 mb-1">
                        {getLabel(data.name)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {data.value} {t('common.transactions')}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1">
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
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        formatter={(value) => {
                            switch (value) {
                                case 'paid': return t('financial.paid');
                                case 'pending': return t('financial.pending');
                                case 'failed': return t('financial.failed');
                                case 'canceled': return t('financial.canceled');
                                default: return value;
                            }
                        }}
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
