import { Search, Plus } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

interface DriverFilterBarProps {
    search: string;
    onSearch: (val: string) => void;
    status: string;
    onStatusChange: (val: string) => void;
    onNewDriver: () => void;
}

export default function DriverFilterBar({
    search,
    onSearch,
    status,
    onStatusChange,
    onNewDriver
}: DriverFilterBarProps) {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-1 gap-4 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder={t('drivers.filter.placeholer_search')}
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        className="w-full pl-10 pr-4 h-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-choco transition-all"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-choco cursor-pointer w-[160px]"
                >
                    <option value="all">{t('drivers.filter.all_statuses')}</option>
                    <option value="AVAILABLE">{t('drivers.filter.available')}</option>
                    <option value="BUSY">{t('drivers.filter.busy')}</option>
                    <option value="OFFLINE">{t('drivers.filter.offline')}</option>
                </select>
            </div>

            <button
                onClick={onNewDriver}
                className="h-10 px-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-sm w-full xl:w-auto"
            >
                <Plus size={16} />
                <span>{t('drivers.filter.new_driver')}</span>
            </button>
        </div>
    );
}
