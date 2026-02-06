'use client';

import { Search, Plus } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

interface Props {
    search: string;
    onSearch: (value: string) => void;
    onNewCategory: () => void;
}

export default function CategoryFilterBar({
    search, onSearch,
    onNewCategory
}: Props) {
    const { t } = useLanguage();

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Search size={12} /> {t('common.actions')}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('financial.search_placeholder')}
                            value={search}
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
                <button
                    onClick={onNewCategory}
                    className="h-10 px-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-sm w-full md:w-auto"
                >
                    <Plus size={16} />
                    <span>{t('financial.new_category')}</span>
                </button>
            </div>
        </div>
    );
}
