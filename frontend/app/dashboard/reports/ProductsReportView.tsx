'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import Cookies from 'js-cookie';
import { Loader2, Package, AlertTriangle, Archive, DollarSign, Filter, X, FileText } from 'lucide-react';
import { displayCurrency, formatCurrency, parseCurrency } from '@/app/utils/formatters';

export default function ProductsReportView() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);

    // Filters
    const [filters, setFilters] = useState({
        category_id: '',
        stock_status: '',
        min_price: '',
        max_price: ''
    });

    useEffect(() => {
        // Fetch Categories for filter
        const fetchCategories = async () => {
            const token = Cookies.get('auth_token') || Cookies.get('admin_token');
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });
                if (res.ok) {
                    const json = await res.json();
                    setCategories(json.data || []);
                }
            } catch (e) {
                console.error("Failed to load categories", e);
            }
        };
        fetchCategories();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        const token = Cookies.get('auth_token') || Cookies.get('admin_token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

        try {
            const queryParams = {
                ...filters,
                min_price: filters.min_price ? parseCurrency(filters.min_price) : '',
                max_price: filters.max_price ? parseCurrency(filters.max_price) : ''
            };
            const query = new URLSearchParams(queryParams as any).toString();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/report?${query}`, { headers });
            if (response.ok) {
                const result = await response.json();
                setData(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch product report", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handlePriceChange = (key: string, value: string) => {
        const formatted = formatCurrency(value);
        setFilters(prev => ({ ...prev, [key]: formatted }));
    };

    const clearFilters = () => {
        setFilters({ category_id: '', stock_status: '', min_price: '', max_price: '' });
    };

    const hasActiveFilters = Object.values(filters).some(val => val !== '');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Filters Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-end no-print">
                <div className="w-full md:w-1/4">
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('reports.filters.category')}</label>
                    <select
                        value={filters.category_id}
                        onChange={(e) => handleFilterChange('category_id', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20"
                    >
                        <option value="">{t('reports.placeholders.select_category')}</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full md:w-1/4">
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('reports.filters.stock_status')}</label>
                    <select
                        value={filters.stock_status}
                        onChange={(e) => handleFilterChange('stock_status', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20"
                    >
                        <option value="">{t('reports.placeholders.select_status')}</option>
                        <option value="in_stock">{t('reports.placeholders.in_stock')}</option>
                        <option value="low_stock">{t('reports.placeholders.low_stock')}</option>
                        <option value="out_of_stock">{t('reports.placeholders.out_of_stock')}</option>
                    </select>
                </div>

                <div className="w-full md:w-1/4 flex gap-2">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">{t('reports.filters.min_price')}</label>
                        <input
                            type="text"
                            placeholder="R$ 0,00"
                            value={filters.min_price}
                            onChange={(e) => handlePriceChange('min_price', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">{t('reports.filters.max_price')}</label>
                        <input
                            type="text"
                            placeholder="R$ 0,00"
                            value={filters.max_price}
                            onChange={(e) => handlePriceChange('max_price', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-medium text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex items-center gap-2"
                        >
                            <X size={16} />
                            {t('reports.filters.clear')}
                        </button>
                    )}
                </div>
            </div>

            {loading && !data ? (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="animate-spin text-brand-primary" size={40} />
                </div>
            ) : data ? (
                <>
                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
                                <Package size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('reports.metrics.total_products')}</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{data.metrics.total_products}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/30 dark:text-emerald-400">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('reports.metrics.inventory_value')}</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{displayCurrency(data.metrics.total_inventory_value)}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg dark:bg-amber-900/30 dark:text-amber-400">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('reports.metrics.low_stock')}</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{data.metrics.low_stock_count}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-rose-100 text-rose-600 rounded-lg dark:bg-rose-900/30 dark:text-rose-400">
                                <Archive size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('reports.metrics.out_of_stock')}</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{data.metrics.out_of_stock_count}</p>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('reports.tabs.products')} {t('reports.list')}</h3>
                            <button
                                onClick={() => window.print()}
                                disabled={!data || data.products.length === 0}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed no-print"
                            >
                                <FileText size={16} />
                                {t('reports.actions.generate_pdf')}
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('reports.table.product')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('reports.table.category')}</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('reports.table.price')}</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('reports.table.stock')}</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('reports.table.status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data.products.length > 0 ? (
                                        data.products.map((product: any) => (
                                            <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <div className="px-6 py-4 flex items-center gap-3">
                                                    {product.image_path ? (
                                                        <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${product.image_path}`} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                            <Package size={18} />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{product.name}</div>
                                                        <div className="text-xs text-slate-500">SKU: {product.sku}</div>
                                                    </div>
                                                </div>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {product.category?.name || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium text-slate-900 dark:text-slate-100">
                                                    {displayCurrency(product.price)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                        ${product.stock_quantity <= 0
                                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                                                            : product.stock_quantity <= product.min_stock_level
                                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        }
                                                    `}>
                                                        {product.stock_quantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                        ${product.status === 'active'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                            : 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400'
                                                        }
                                                    `}>
                                                        {product.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                                {t('products.no_found_matches')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}
