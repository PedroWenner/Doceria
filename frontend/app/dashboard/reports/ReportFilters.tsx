
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Filter, X } from 'lucide-react';

interface Props {
    filters: {
        type: string;
        category_id: string;
        payment_method_id: string;
    };
    onFilterChange: (key: string, value: string) => void;
    onClear: () => void;
}

export default function ReportFilters({ filters, onFilterChange, onClear }: Props) {
    const [categories, setCategories] = useState<any[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = Cookies.get('auth_token') || Cookies.get('admin_token');
            const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

            try {
                // Fetch Categories
                const catRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expense-categories`, { headers });
                if (catRes.ok) {
                    const data = await catRes.json();
                    setCategories(data.data || []);
                }

                // Fetch Payment Methods
                const pmRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment-methods`, { headers });
                if (pmRes.ok) {
                    const data = await pmRes.json();
                    setPaymentMethods(data.data || []);
                }
            } catch (err) {
                console.error("Failed to load filter options", err);
            }
        };
        fetchData();
    }, []);

    const hasActiveFilters = filters.type || filters.category_id || filters.payment_method_id;

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-end">

            {/* Type Filter */}
            <div className="w-full md:w-1/4">
                <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                <select
                    value={filters.type}
                    onChange={(e) => onFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20"
                >
                    <option value="">All Transactions</option>
                    <option value="income">Income (Receitas)</option>
                    <option value="expense">Expenses (Despesas)</option>
                </select>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-1/4">
                <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                <select
                    value={filters.category_id}
                    onChange={(e) => onFilterChange('category_id', e.target.value)}
                    disabled={filters.type === 'income'} // Incomes don't have categories yet
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-50"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Payment Method Filter */}
            <div className="w-full md:w-1/4">
                <label className="block text-xs font-medium text-slate-500 mb-1">Payment Method</label>
                <select
                    value={filters.payment_method_id}
                    onChange={(e) => onFilterChange('payment_method_id', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20"
                >
                    <option value="">All Methods</option>
                    {paymentMethods.map((pm) => (
                        <option key={pm.id} value={pm.id}>
                            {pm.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {hasActiveFilters && (
                    <button
                        onClick={onClear}
                        className="px-4 py-2 text-sm font-medium text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex items-center gap-2"
                    >
                        <X size={16} />
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
