'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Plus, Search, Filter } from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import ExpenseTable from '@/app/components/expenses/ExpenseTable';
import ExpenseModal from '@/app/components/expenses/ExpenseModal';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import ProDatePicker from '@/app/components/ProDatePicker';

export default function ExpensesPage() {
    const { t } = useLanguage();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);

    // Filters
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('all');
    const [status, setStatus] = useState('all');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, id: null as number | null });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchExpenses = async () => {
        setLoading(true);
        const token = Cookies.get('admin_token');
        try {
            const query = new URLSearchParams();
            if (search) query.append('search', search);
            if (categoryId !== 'all') query.append('category_id', categoryId);
            if (status !== 'all') query.append('status', status);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses?${query.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setExpenses(data.data.data); // Pagination wrapper
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        const token = Cookies.get('admin_token');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expense-categories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setCategories(data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchExpenses();
    }, []);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchExpenses();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, categoryId, status]);

    const handleDeleteClick = (id: number) => {
        setDeleteConfirmation({ isOpen: true, id });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation.id) return;
        setIsDeleting(true);

        const token = Cookies.get('admin_token');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/${deleteConfirmation.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success(t('financial.delete_success'));
                fetchExpenses();
            } else {
                toast.error(t('common.error'));
            }
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setIsDeleting(false);
            setDeleteConfirmation({ isOpen: false, id: null });
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {t('financial.expenses')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {t('financial.expenses_subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => { setSelectedExpense(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm"
                >
                    <Plus size={20} />
                    <span>{t('financial.new_expense')}</span>
                </button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

                {/* Filters */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-4 md:space-y-0 md:flex md:gap-4 items-center">

                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder={t('financial.search_placeholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full md:w-auto">
                        {/* Category Filter */}
                        <div className="md:w-40">
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none cursor-pointer"
                            >
                                <option value="all">{t('financial.all_categories')}</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="md:w-32">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none cursor-pointer"
                            >
                                <option value="all">{t('financial.all_statuses')}</option>
                                <option value="paid">{t('financial.paid')}</option>
                                <option value="pending">{t('financial.pending')}</option>
                            </select>
                        </div>
                    </div>

                </div>

                {/* Table */}
                <ExpenseTable
                    expenses={expenses}
                    loading={loading}
                    onEdit={(expense) => { setSelectedExpense(expense); setIsModalOpen(true); }}
                    onDelete={handleDeleteClick}
                />
            </div>

            <ExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchExpenses}
                expense={selectedExpense}
            />

            <DeleteConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null })}
                onConfirm={handleConfirmDelete}
                message={t('financial.confirm_delete')}
                isDeleting={isDeleting}
            />
        </div>
    );
}