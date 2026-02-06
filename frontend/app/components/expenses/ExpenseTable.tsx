'use client';

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Edit2, Trash2, Calendar, CreditCard, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface Expense {
    id: number;
    description: string;
    amount: number;
    date: string;
    category: { name: string; color: string };
    status: 'paid' | 'pending';
    payment_method: string;
}

interface ExpenseTableProps {
    expenses: Expense[];
    onEdit: (expense: Expense) => void;
    onDelete: (id: number) => void;
    loading: boolean;
}

export default function ExpenseTable({ expenses, onEdit, onDelete, loading }: ExpenseTableProps) {
    const { t } = useLanguage();

    if (loading) {
        return <div className="p-12 text-center text-slate-400">{t('common.loading')}</div>;
    }

    if (expenses.length === 0) {
        return <div className="p-12 text-center text-slate-400">{t('financial.no_expenses')}</div>;
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase text-slate-400 font-semibold tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
                        <th className="px-6 py-4">{t('financial.description')}</th>
                        <th className="px-6 py-4">{t('financial.category')}</th>
                        <th className="px-6 py-4">{t('financial.date')}</th>
                        <th className="px-6 py-4">{t('financial.value')}</th>
                        <th className="px-6 py-4 text-center">{t('financial.status')}</th>
                        <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {expenses.map((expense) => (
                        <tr key={expense.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                {expense.description}
                                <div className="text-xs text-slate-400 font-normal flex items-center gap-1 mt-0.5 md:hidden">
                                    {formatCurrency(Number(expense.amount))}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                                    style={{
                                        backgroundColor: `${expense.category.color}20`,
                                        borderColor: `${expense.category.color}40`,
                                        color: expense.category.color
                                    }}
                                >
                                    {expense.category.name}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} className="opacity-70" />
                                    {format(new Date(expense.date), 'dd/MM/yyyy')}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                                {formatCurrency(Number(expense.amount))}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {expense.status === 'paid' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                        {t('financial.paid')}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                        {t('financial.pending')}
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onEdit(expense)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(expense.id)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
