
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
    // Prepare Data for Chart
    // We need to merge primary and comparison by "Day Index" (1st, 2nd, 3rd day of period) 
    // since dates might not match (e.g. Jan vs Feb).

    const chartData = (primaryData || []).map((item, index) => {
        const compareItem = comparisonData && comparisonData[index];
        return {
            x: item.formatted_date, // Label (e.g. 01/01)
            primaryRevenue: Number(item.revenue),
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
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            backgroundColor: '#fff',
                            color: '#1e293b'
                        }}
                        formatter={(value: number, name: string, props: any) => {
                            const label = name === 'primaryRevenue' ? 'Current Period' : `Previous (${props.payload.compareDate})`;
                            return [displayCurrency(value), label] as [string, string];
                        }}
                    />
                    <Legend />
                    <Bar
                        dataKey="primaryRevenue"
                        name="Current Period"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    />
                    {comparisonData && (
                        <Bar
                            dataKey="compareRevenue"
                            name="Comparison"
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
