'use client';

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { displayCurrency } from '@/app/utils/formatters';
import { ShoppingBag, TrendingUp } from 'lucide-react';
import Image from 'next/image';

interface ProductData {
    id: number;
    name: string;
    image: string | null;
    sold: number;
    revenue: number;
}

interface Props {
    data: ProductData[];
}

export default function TopProductsWidget({ data }: Props) {
    const { t } = useLanguage();

    if (!data || data.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col items-center justify-center text-slate-400">
                <ShoppingBag size={48} className="mb-2 opacity-20" />
                <p>{t('financial.no_data')}</p>
            </div>
        );
    }

    const maxRevenue = Math.max(...data.map(p => Number(p.revenue)));

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" />
                {t('financial.top_products')}
            </h3>

            <div className="space-y-5">
                {data.map((product, index) => (
                    <div key={product.id} className="group">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-slate-200 dark:border-slate-700">
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                                            IMG
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{product.name}</p>
                                    <p className="text-xs text-slate-500">{product.sold} {t('financial.units_sold')}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{displayCurrency(product.revenue)}</p>
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out group-hover:bg-emerald-400"
                                style={{ width: `${(Number(product.revenue) / maxRevenue) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
