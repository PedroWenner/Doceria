import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    isDeleting?: boolean;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isDeleting = false
}: DeleteConfirmationModalProps) {
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="w-full max-w-sm bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-scaleIn">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                        <AlertTriangle size={24} className="text-rose-500" />
                        <span className="text-rose-500">{title || t('common.delete')}</span>
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500 dark:text-rose-400">
                        <Trash2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">{title || t('common.delete')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {message || t('common.confirm_delete')}
                    </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex gap-3 justify-center border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        disabled={isDeleting}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-5 py-2 rounded-lg bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all shadow-sm shadow-rose-500/20 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isDeleting ? t('common.saving') : t('financial.confirm_delete_button')}
                    </button>
                </div>
            </div>
        </div>
    );
}
