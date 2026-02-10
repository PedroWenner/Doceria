'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Upload, FileText, Trash2 } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import ProDatePicker from '@/app/components/ProDatePicker';
import { formatCurrency, parseCurrency } from '@/app/utils/formatters';

interface Category {
    id: number;
    name: string;
}

interface Expense {
    id: number;
    description: string;
    amount: number;
    date: string;
    category_id: number;
    status: 'paid' | 'pending';
    payment_method: string;
    notes?: string;
    attachments?: { id: number; original_name: string; file_path: string }[];
}

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    expense?: Expense | null;
}

export default function ExpenseModal({ isOpen, onClose, onSuccess, expense }: ExpenseModalProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const [files, setFiles] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
    const [removedAttachmentIds, setRemovedAttachmentIds] = useState<number[]>([]);

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-'), // YYYY-MM-DD Local
        category_id: '',
        status: 'paid',
        payment_method: 'money',
        notes: ''
    });

    useEffect(() => {
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

        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    useEffect(() => {
        if (expense) {
            setFormData({
                description: expense.description,
                amount: formatCurrency(expense.amount),
                date: expense.date.split('T')[0],
                category_id: expense.category_id.toString(),
                status: expense.status,
                payment_method: expense.payment_method,
                notes: expense.notes || ''
            });
            setExistingAttachments(expense.attachments || []);
        } else {
            setFormData({
                description: '',
                amount: '',
                date: new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-'), // YYYY-MM-DD Local
                category_id: '',
                status: 'paid',
                payment_method: 'money',
                notes: ''
            });
            setExistingAttachments([]);
        }
        setFiles([]);
        setRemovedAttachmentIds([]);
    }, [expense, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = Cookies.get('admin_token');
        const url = expense
            ? `${process.env.NEXT_PUBLIC_API_URL}/expenses/${expense.id}`
            : `${process.env.NEXT_PUBLIC_API_URL}/expenses`;

        const method = expense ? 'POST' : 'POST'; // Always POST for FormData with files, use _method=PUT for updates if needed but Laravel handles POST update slightly differently or we can just use POST logic.
        // Actually, strictly speaking, uploading files via PUT is tricky. Common pattern in Laravel is POST with _method field.

        const submitData = new FormData();
        submitData.append('description', formData.description);
        submitData.append('amount', parseCurrency(formData.amount).toString());
        submitData.append('date', formData.date);
        submitData.append('category_id', formData.category_id);
        submitData.append('status', formData.status);
        submitData.append('payment_method', formData.payment_method);
        submitData.append('notes', formData.notes || '');

        files.forEach(file => {
            submitData.append('documents[]', file);
        });

        if (expense) {
            submitData.append('_method', 'PUT');

            // Handle removed attachments immediately or pass IDs to backend? 
            // Best approach: Call delete endpoint separately or handle in update. 
            // My implementation plan suggested removeAttachment endpoint.
            // Let's call remove for each ID first.
            for (const id of removedAttachmentIds) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/attachments/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        }

        try {
            const response = await fetch(url, {
                method: 'POST', // Always POST when sending FormData
                headers: {
                    'Authorization': `Bearer ${token}`
                    // 'Content-Type': 'multipart/form-data' // Do NOT set this manually, let browser set boundary
                },
                body: submitData
            });

            if (!response.ok) throw new Error('Failed to save expense');

            toast.success(t('financial.save_success'));
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        {expense ? t('financial.edit_expense') : t('financial.new_expense')}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('financial.description')}
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder={t('financial.select_option')}
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('financial.amount')}
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: formatCurrency(e.target.value) })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-bold"
                            placeholder="R$ 0,00"
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <ProDatePicker
                            label={t('financial.date')}
                            value={formData.date}
                            onChange={(date) => setFormData({ ...formData, date })}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('financial.category')}
                        </label>
                        <select
                            required
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="">{t('financial.select_option')}</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('financial.payment_method')}
                        </label>
                        <select
                            required
                            value={formData.payment_method}
                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="money">{t('financial.methods.money')}</option>
                            <option value="pix">{t('financial.methods.pix')}</option>
                            <option value="card">{t('financial.methods.card')}</option>
                            <option value="transfer">{t('financial.methods.transfer')}</option>
                            <option value="boleto">{t('financial.methods.boleto')}</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('financial.status')}
                        </label>
                        <select
                            required
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="paid">{t('financial.paid')}</option>
                            <option value="pending">{t('financial.pending')}</option>
                        </select>
                    </div>

                    {/* Notes */}
                    {/* Attachments */}
                    <div className="md:col-span-2 space-y-3">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('financial.attachments')}
                        </label>

                        {/* File Input */}
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-3 text-slate-400" />
                                    <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                                        <span className="font-semibold">{t('financial.click_upload')}</span>
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">PDF, PNG, JPG (MAX. 10MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    multiple
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setFiles([...files, ...Array.from(e.target.files)]);
                                        }
                                    }}
                                />
                            </label>
                        </div>

                        {/* Selected Files List */}
                        {(files.length > 0 || existingAttachments.length > 0) && (
                            <div className="space-y-2">
                                {/* New Files */}
                                {files.map((file, index) => (
                                    <div key={`new-${index}`} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{file.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB • {t('common.new')}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFiles(files.filter((_, i) => i !== index))}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}

                                {/* Existing Attachments */}
                                {existingAttachments.map((att) => (
                                    <div key={att.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <a
                                                    href={`${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}/storage/${att.file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:underline hover:text-blue-600"
                                                >
                                                    {att.original_name}
                                                </a>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{att.mime_type}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRemovedAttachmentIds([...removedAttachmentIds, att.id]);
                                                setExistingAttachments(existingAttachments.filter(item => item.id !== att.id));
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="md:col-span-2 flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-medium shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check size={18} />
                                    {t('common.save')}
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
