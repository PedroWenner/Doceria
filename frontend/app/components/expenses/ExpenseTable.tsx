'use client';

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Edit2, Trash2, Calendar, CreditCard, Tag, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { displayCurrency } from '@/app/utils/formatters';

interface Expense {
    id: number;
    description: string;
    amount: number;
    date: string;
    category: { name: string; color: string };
    status: 'paid' | 'pending';
    payment_method: string;
    attachments_count?: number;
    attachments?: any[];
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

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('financial.description')}</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('financial.category')}</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('financial.date')}</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('financial.value')}</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">{t('financial.status')}</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('common.actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    {expense.description}
                                    {expense.attachments && expense.attachments.length > 0 && (
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400" title={`${expense.attachments.length} anexo(s)`}>
                                            <Paperclip size={12} />
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-slate-400 font-normal flex items-center gap-1 mt-0.5 md:hidden">
                                    {displayCurrency(expense.amount)}
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
                                    {format(new Date(expense.date.split('T')[0] + 'T00:00:00'), 'dd/MM/yyyy')}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                {displayCurrency(expense.amount)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {expense.status === 'paid' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30">
                                        {t('financial.paid')}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30">
                                        {t('financial.pending')}
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(expense)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(expense.id)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <Trash2 size={18} />
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
