import { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { X, Check } from 'lucide-react';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (user: any) => Promise<void>;
    roles: any[];
    isSaving: boolean;
}

export default function UserModal({ isOpen, onClose, onSubmit, roles, isSaving }: UserModalProps) {
    const { t } = useLanguage();
    const [user, setUser] = useState({ name: '', email: '', password: '', role: 'customer' });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(user);
        setUser({ name: '', email: '', password: '', role: 'customer' }); // Reset form
    };

    return (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-scaleIn">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t('users.new_user') || 'Novo Usuário'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('common.name')}</label>
                        <input
                            required
                            type="text"
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none"
                            value={user.name}
                            onChange={e => setUser({ ...user, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('users.email')}</label>
                        <input
                            required
                            type="email"
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none"
                            value={user.email}
                            onChange={e => setUser({ ...user, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('auth.password')}</label>
                        <input
                            required
                            type="password"
                            minLength={6}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none"
                            value={user.password}
                            onChange={e => setUser({ ...user, password: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('users.roles')}</label>
                        <select
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none"
                            value={user.role}
                            onChange={e => setUser({ ...user, role: e.target.value })}
                        >
                            {roles.map(role => (
                                <option key={role.id} value={role.slug}>{role.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-5 py-2 rounded-lg bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
                        >
                            {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={18} /> {t('common.save') || 'Criar'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
