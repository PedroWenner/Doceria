'use client';

import { Search, Filter, Plus } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

interface Props {
    search: string;
    onSearch: (value: string) => void;
    categoryId: string;
    onCategoryChange: (id: string) => void;
    status: string;
    onStatusChange: (status: string) => void;
    categories: { id: number; name: string }[];
    onNewProduct: () => void;
}

export default function ProductFilterBar({
    search, onSearch,
    categoryId, onCategoryChange,
    status, onStatusChange,
    categories,
    onNewProduct
}: Props) {
    const { t } = useLanguage();

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row gap-4 items-end">
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Search */}
                <div className="space-y-1 lg:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Search size={12} /> {t('common.actions')}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('products.search_placeholder')}
                            value={search}
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Filter size={12} /> {t('products.category')}
                    </label>
                    <select
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all cursor-pointer"
                        value={categoryId}
                        onChange={(e) => onCategoryChange(e.target.value)}
                    >
                        <option value="all">{t('financial.all_categories') || 'Todas'}</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
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
                        <option value="all">{t('financial.all_statuses') || 'Todos'}</option>
                        <option value="active">{t('common.active') || 'Ativo'}</option>
                        <option value="draft">{t('common.inactive') || 'Inativo/Rascunho'}</option>
                    </select>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full xl:w-auto">
                <button
                    onClick={onNewProduct}
                    className="h-10 px-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-sm w-full xl:w-auto"
                >
                    <Plus size={16} />
                    <span>{t('products.new_product')}</span>
                </button>
            </div>
        </div>
    );
}
