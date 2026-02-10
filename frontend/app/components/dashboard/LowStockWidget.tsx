'use client';

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { AlertTriangle, PackageX } from 'lucide-react';

interface ProductData {
    id: number;
    name: string;
    stock_quantity: number;
    min_stock_level: number;
    image: string | null;
}

interface Props {
    data: ProductData[];
}

export default function LowStockWidget({ data }: Props) {
    const { t } = useLanguage();

    if (!data || data.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col items-center justify-center text-emerald-500">
                <PackageX size={48} className="mb-2 opacity-20" />
                <p className="font-medium">{t('financial.stock_ok')}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                {t('financial.low_stock')}
            </h3>

            <div className="space-y-4">
                {data.map((product) => {
                    const isCritical = product.stock_quantity === 0;

                    return (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-amber-200 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                                <div>
                                    <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm truncate max-w-[150px]">{product.name}</p>
                                    <p className="text-xs text-slate-500">
                                        Min: {product.min_stock_level}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${isCritical
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                    }`}>
                                    {product.stock_quantity} {t('common.units_short')}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
