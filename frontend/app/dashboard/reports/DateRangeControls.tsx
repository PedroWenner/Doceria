
import React from 'react';
import { Calendar, RefreshCcw } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import ProDatePicker from '@/app/components/ProDatePicker';

interface Props {
    startDate: string;
    endDate: string;
    compareStartDate: string;
    compareEndDate: string;
    onDateChange: (start: string, end: string) => void;
    onCompareDateChange: (start: string, end: string) => void;
    onRefresh: () => void;
}

export default function DateRangeControls({
    startDate,
    endDate,
    compareStartDate,
    compareEndDate,
    onDateChange,
    onCompareDateChange,
    onRefresh
}: Props) {
    const { t } = useLanguage();

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                {/* Primary Date Range */}
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Period:</span>
                    <div className="w-auto">
                        <ProDatePicker
                            value={startDate}
                            onChange={(val) => onDateChange(val, endDate)}
                        />
                    </div>
                    <span className="text-slate-400">-</span>
                    <div className="w-auto">
                        <ProDatePicker
                            value={endDate}
                            onChange={(val) => onDateChange(startDate, val)}
                        />
                    </div>
                </div>

                {/* Comparison Date Range */}
                <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Compare:</span>
                    <div className="w-auto">
                        <ProDatePicker
                            value={compareStartDate}
                            onChange={(val) => onCompareDateChange(val, compareEndDate)}
                        />
                    </div>
                    <span className="text-slate-400">-</span>
                    <div className="w-auto">
                        <ProDatePicker
                            value={compareEndDate}
                            onChange={(val) => onCompareDateChange(compareStartDate, val)}
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={onRefresh}
                className="p-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                title="Refresh Data"
            >
                <RefreshCcw size={18} />
            </button>
        </div>
    );
}
