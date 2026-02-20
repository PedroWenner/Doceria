import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/app/context/LanguageContext';

interface DriverModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    token?: string;
}

export default function DriverModal({ isOpen, onClose, onSuccess, token }: DriverModalProps) {
    const { t } = useLanguage();
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState('');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return toast.error('O nome é obrigatório.');

        setIsSaving(true);
        try {
            const res = await fetch(`${apiUrl}/drivers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    type: 'OWN_FLEET'
                })
            });

            if (res.ok) {
                toast.success('Motorista cadastrado com sucesso!');
                setName('');
                onSuccess();
                onClose();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Erro ao cadastrar motorista.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro de conexão ao salvar.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-scaleIn">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                        {t('drivers.filter.new_driver') || 'Novo Motorista'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                            {t('drivers.modal.name')} *
                        </label>
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-choco focus:outline-none transition-all"
                            placeholder="Ex: João da Silva"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-5 py-2 rounded-lg bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
                        >
                            {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={18} /> {t('common.save')}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
