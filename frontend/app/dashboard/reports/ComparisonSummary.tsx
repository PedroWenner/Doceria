
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { displayCurrency } from '@/app/utils/formatters';

interface Props {
    title: string;
    primaryValue: number;
    comparisonValue: number;
    icon: React.ReactNode;
    colorClass: string;
    invertTrend?: boolean; // For expenses, Up is bad (Red)
}

export default function ComparisonSummary({ title, primaryValue, comparisonValue, icon, colorClass, invertTrend = false }: Props) {

    const diff = primaryValue - comparisonValue;
    const percentage = comparisonValue > 0 ? (diff / comparisonValue) * 100 : 0;

    // Determine Trend Color
    // Default: Up is Good (Green), Down is Bad (Red)
    // Inverted: Up is Bad (Red), Down is Good (Green)
    let trendColor = 'text-slate-500';
    let TrendIcon = Minus;

    if (diff > 0) {
        trendColor = invertTrend ? 'text-rose-500' : 'text-emerald-500';
        TrendIcon = ArrowUpRight;
    } else if (diff < 0) {
        trendColor = invertTrend ? 'text-emerald-500' : 'text-rose-500';
        TrendIcon = ArrowDownRight;
    }

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <h3 className={`text-2xl font-bold mt-1 ${colorClass}`}>
                        {displayCurrency(primaryValue)}
                    </h3>
                </div>
                <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 ${colorClass}`}>
                    {icon}
                </div>
            </div>

            {/* Comparison Badge */}
            <div className="flex items-center gap-2">
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 ${trendColor}`}>
                    <TrendIcon size={14} className="mr-1" />
                    {Math.abs(percentage).toFixed(1)}%
                </div>
                <span className="text-xs text-slate-400">vs {displayCurrency(comparisonValue)} prev.</span>
            </div>
        </div>
    );
}
