import { useLanguage } from '@/app/context/LanguageContext';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message?: string;
    isDeleting?: boolean;
}

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, message, isDeleting = false }: DeleteConfirmationModalProps) {
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="w-full max-w-sm bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-scaleIn">
                <div className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto text-red-600 dark:text-red-500">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t('common.delete_confirm_title') || 'Confirmar Exclusão'}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {message || t('common.delete_confirm_message') || 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.'}
                    </p>
                </div>
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isDeleting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (t('common.delete') || 'Excluir')}
                    </button>
                </div>
            </div>
        </div>
    );
}
