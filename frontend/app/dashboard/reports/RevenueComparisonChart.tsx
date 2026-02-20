
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { displayCurrency } from '@/app/utils/formatters';

interface ChartDataPoint {
    date: string;
    formatted_date: string;
    revenue: number;
    expenses: number;
    profit: number;
}

interface Props {
    primaryData: ChartDataPoint[];
    comparisonData?: ChartDataPoint[] | null;
}

export default function RevenueComparisonChart({ primaryData, comparisonData }: Props) {
    const chartData = (primaryData || []).map((item, index) => {
        const compareItem = comparisonData && comparisonData[index];
        return {
            x: item.formatted_date,
            primaryRevenue: Number(item.revenue),
            primaryExpenses: Number(item.expenses),
            primaryProfit: Number(item.profit),
            compareRevenue: compareItem ? Number(compareItem.revenue) : 0,
            compareDate: compareItem ? compareItem.formatted_date : ''
        };
    });

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                    <XAxis
                        dataKey="x"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => `R$ ${value}`}
                    />
                    <Tooltip
                        cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            backgroundColor: '#fff',
                            color: '#1e293b'
                        }}
                        formatter={(value: any, name: any) => {
                            const labels: Record<string, string> = {
                                primaryRevenue: 'Revenue',
                                primaryExpenses: 'Expenses',
                                primaryProfit: 'Profit',
                                compareRevenue: 'Comparison Rev.'
                            };
                            return [displayCurrency(Number(value) || 0), labels[name] || name] as [string, string];
                        }}
                    />
                    <Legend iconType="circle" />
                    <Bar
                        dataKey="primaryRevenue"
                        name="Revenue"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="primaryExpenses"
                        name="Expenses"
                        fill="#f43f5e"
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="primaryProfit"
                        name="Profit"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                    />
                    {comparisonData && (
                        <Bar
                            dataKey="compareRevenue"
                            name="Comp. Revenue"
                            fill="#cbd5e1"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                        />
                    )}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
