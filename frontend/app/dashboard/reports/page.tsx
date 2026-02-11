'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { LayoutDashboard, Package, ShoppingBag, Users } from 'lucide-react';
import FinancialReportView from './FinancialReportView';
import ProductsReportView from './ProductsReportView';
import OrdersReportView from './OrdersReportView';

type ReportType = 'financial' | 'products' | 'orders' | 'customers';

export default function ReportsPage() {
    const { t } = useLanguage();
    const [selectedReport, setSelectedReport] = useState<ReportType>('financial');

    const reportTypes = [
        { id: 'financial', label: t('reports.tabs.financial'), icon: <LayoutDashboard size={18} /> },
        { id: 'products', label: t('reports.tabs.products'), icon: <Package size={18} /> },
        { id: 'orders', label: t('reports.tabs.orders'), icon: <ShoppingBag size={18} /> },
        { id: 'customers', label: t('reports.tabs.customers'), icon: <Users size={18} /> },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {t('reports.title')}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        {t('reports.subtitle')}
                    </p>
                </div>
            </div>

            {/* Report Type Selector */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {reportTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setSelectedReport(type.id as ReportType)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
                            ${selectedReport === type.id
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }
                        `}
                    >
                        {type.icon}
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Report Content */}
            <div className="min-h-[500px]">
                {selectedReport === 'financial' && <FinancialReportView />}
                {selectedReport === 'products' && <ProductsReportView />}
                {selectedReport === 'orders' && <OrdersReportView />}

                {selectedReport === 'customers' && (
                    <div className="p-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">
                            {t('reports.tabs.customers')}
                        </h3>
                        <p>Em breve: Melhores clientes e frequência de compra.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
