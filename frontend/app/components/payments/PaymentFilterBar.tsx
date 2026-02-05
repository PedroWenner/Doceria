'use client';

import { Search, Filter, Plus } from 'lucide-react';
import ProDatePicker from '@/app/components/ProDatePicker';

interface Props {
    search: string;
    onSearch: (value: string) => void;
    status: string;
    onStatusChange: (status: string) => void;
    method: string;
    onMethodChange: (method: string) => void;
    dateFrom: string;
    onDateFromChange: (date: string) => void;
    dateTo: string;
    onDateToChange: (date: string) => void;
    onNewPayment: () => void;
}

import { useLanguage } from '@/app/context/LanguageContext';

export default function PaymentFilterBar({
    search, onSearch,
    status, onStatusChange,
    method, onMethodChange,
    dateFrom, onDateFromChange,
    dateTo, onDateToChange,
    onNewPayment
}: Props) {
    const { t } = useLanguage();

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row gap-4 items-end">
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                {/* Search */}
                <div className="space-y-1 lg:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Search size={12} /> {t('common.actions')}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('payments_dashboard.filter.search_placeholder')}
                            value={search}
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Filter size={12} /> {t('common.status')}
                    </label>
                    <select
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all cursor-pointer"
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value)}
                    >
                        <option value="all">{t('payments_dashboard.filter.all_statuses')}</option>
                        <option value="paid">{t('orders.payment_status.paid')}</option>
                        <option value="pending">{t('orders.payment_status.pending')}</option>
                        <option value="failed">{t('orders.payment_status.failed')}</option>
                    </select>
                </div>

                {/* Date From */}
                <div className="flex-1 min-w-[140px]">
                    <ProDatePicker
                        label={t('payments_dashboard.filter.date_from')}
                        value={dateFrom}
                        onChange={onDateFromChange}
                    />
                </div>

                {/* Date To */}
                <div className="flex-1 min-w-[140px]">
                    <ProDatePicker
                        label={t('payments_dashboard.filter.date_to')}
                        value={dateTo}
                        onChange={onDateToChange}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full xl:w-auto">
                <button
                    onClick={onNewPayment}
                    className="h-10 px-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-sm w-full xl:w-auto"
                >
                    <Plus size={16} />
                    <span>{t('payments_dashboard.filter.new_payment')}</span>
                </button>
            </div>
        </div>
    );
}
