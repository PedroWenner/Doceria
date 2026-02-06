import { Search, Users, Plus } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

interface UserFilterBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onNewUser: () => void;
}

export default function UserFilterBar({ searchTerm, onSearchChange, onNewUser }: UserFilterBarProps) {
    const { t } = useLanguage();

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Search size={12} /> {t('common.actions')}
                </label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t('users.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
                <button
                    onClick={onNewUser}
                    className="h-10 px-4 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-sm w-full md:w-auto"
                >
                    <Users size={16} />
                    <span>{t('users.new_user') || 'Novo Usuário'}</span>
                </button>
            </div>
        </div>
    );
}
