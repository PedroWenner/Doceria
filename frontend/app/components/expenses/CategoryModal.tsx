'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useTheme } from '@/app/context/ThemeContext';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

interface Category {
    id: number;
    name: string;
    description: string;
    color: string;
}

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    category?: Category | null;
}

export default function CategoryModal({ isOpen, onClose, onSuccess, category }: CategoryModalProps) {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3b82f6'
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                description: category.description || '',
                color: category.color || '#3b82f6'
            });
        } else {
            setFormData({
                name: '',
                description: '',
                color: '#3b82f6'
            });
        }
    }, [category, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = Cookies.get('admin_token');
        const url = category
            ? `${process.env.NEXT_PUBLIC_API_URL}/expense-categories/${category.id}`
            : `${process.env.NEXT_PUBLIC_API_URL}/expense-categories`;

        const method = category ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save category');

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
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        {category ? t('financial.edit_category') : t('financial.new_category')}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('common.name')}
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none transition-all"
                            placeholder="Ex: Fornecedores"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('common.description')}
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none transition-all resize-none h-24"
                            placeholder="Ex: Pagamentos para fornecedores de matéria-prima."
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('financial.color')}
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="h-10 w-20 rounded cursor-pointer border-0 p-0"
                            />
                            <span className="text-sm text-slate-500 uppercase font-mono">{formData.color}</span>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 pt-4">
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
