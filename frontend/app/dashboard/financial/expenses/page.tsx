'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import ExpenseTable from '@/app/components/expenses/ExpenseTable';
import ExpenseModal from '@/app/components/expenses/ExpenseModal';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import ProDatePicker from '@/app/components/ProDatePicker';
import ExpenseFilterBar from '@/app/components/expenses/ExpenseFilterBar';

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
            </div>

            {/* Filters */}
            <div className="relative">
                <ExpenseFilterBar
                    search={search}
                    onSearch={setSearch}
                    categoryId={categoryId}
                    onCategoryChange={setCategoryId}
                    categories={categories}
                    status={status}
                    onStatusChange={setStatus}
                    onNewExpense={() => { setSelectedExpense(null); setIsModalOpen(true); }}
                />
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

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