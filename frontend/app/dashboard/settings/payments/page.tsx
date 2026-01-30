'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import Cookies from 'js-cookie';
import { useLanguage } from '@/app/context/LanguageContext';
import toast from 'react-hot-toast';
import {
    CreditCard,
    Plus,
    Power,
    Trash2,
    Pencil,
    Search,
    X,
    Check,
    AlertCircle,
    AlertTriangle
} from 'lucide-react';

interface PaymentMethod {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
}

export default function PaymentMethodsPage() {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

    // Confirmation State
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, methodId: number | null }>({
        isOpen: false,
        methodId: null
    });

    // Form State
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');

    const { t } = useLanguage();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = Cookies.get('admin_token');

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        try {
            const res = await fetch(`${apiUrl}/payment-methods/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setMethods(data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error(t('payment_methods.load_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = async (id: number) => {
        try {
            const res = await fetch(`${apiUrl}/payment-methods/${id}/toggle`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success(t('payment_methods.update_status_success'));
                fetchMethods();
            }
        } catch (error) {
            toast.error(t('payment_methods.update_status_error'));
        }
    };

    const confirmDelete = (id: number) => {
        setDeleteConfirmation({ isOpen: true, methodId: id });
    };

    const handleDelete = async () => {
        if (!deleteConfirmation.methodId) return;

        try {
            const res = await fetch(`${apiUrl}/payment-methods/${deleteConfirmation.methodId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success(t('payment_methods.delete_success'));
                fetchMethods();
                setDeleteConfirmation({ isOpen: false, methodId: null });
            }
        } catch (error) {
            toast.error(t('payment_methods.delete_error'));
        }
    };

    const openModal = (method?: PaymentMethod) => {
        if (method) {
            setEditingMethod(method);
            setName(method.name);
            setSlug(method.slug);
        } else {
            setEditingMethod(null);
            setName('');
            setSlug('');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const url = editingMethod
                ? `${apiUrl}/payment-methods/${editingMethod.id}`
                : `${apiUrl}/payment-methods`;

            const method = editingMethod ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, slug })
            });

            if (res.ok) {
                toast.success(t('payment_methods.save_success'));
                setIsModalOpen(false);
                fetchMethods();
            } else {
                const err = await res.json();
                toast.error(err.message || t('payment_methods.save_error'));
            }
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-generate slug
    const handleNameChange = (val: string) => {
        setName(val);
        if (!editingMethod) {
            setSlug(val.toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '_'));
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-3">
                        <CreditCard size={32} className="text-slate-400" />
                        {t('payment_methods.title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm ml-11">{t('payment_methods.subtitle')}</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm"
                >
                    <Plus size={20} />
                    <span>{t('payment_methods.new_method')}</span>
                </button>
            </div>

            {/* Methods Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {methods.map(method => (
                    <div key={method.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <CreditCard size={24} className="text-slate-600 dark:text-slate-400" />
                                </div>
                                <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${method.is_active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${method.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                    {method.is_active ? t('payment_methods.active') : t('payment_methods.inactive')}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1">{method.name}</h3>
                            <div className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400 font-mono text-xs">
                                {method.slug}
                            </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 p-4 flex gap-2 bg-slate-50/50 dark:bg-slate-900/50">
                            <button
                                onClick={() => handleToggle(method.id)}
                                className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded-lg transition-colors border ${method.is_active
                                    ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'}`}
                            >
                                <Power size={16} />
                                {method.is_active ? t('payment_methods.disable') : t('payment_methods.enable')}
                            </button>
                            <button
                                onClick={() => openModal(method)}
                                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                                title="Editar"
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                onClick={() => confirmDelete(method.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
                                title="Excluir"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-scaleIn">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                                {editingMethod ? <Pencil size={18} /> : <Plus size={18} />}
                                {editingMethod ? t('payment_methods.edit_method') : t('payment_methods.new_method')}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('payment_methods.name')}</label>
                                <input
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Ex: Pix"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('payment_methods.slug')}</label>
                                <div className="relative">
                                    <input
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none transition-all font-mono text-sm pl-9"
                                        placeholder="pix"
                                        required
                                    />
                                    <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">#</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    {t('payment_methods.slug_hint')}
                                </p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-5 py-2 rounded-lg bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm disabled:opacity-70 disabled:cursor-wait flex items-center gap-2"
                                >
                                    {isSaving ? <LoadingSpinner /> : <><Check size={18} /> {t('common.save')}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="w-full max-w-sm bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-scaleIn">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500 dark:text-rose-400">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">{t('payment_methods.delete_title')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                {t('payment_methods.delete_message')}
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex gap-3 justify-center border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setDeleteConfirmation({ isOpen: false, methodId: null })}
                                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2 rounded-lg bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all shadow-sm shadow-rose-500/20"
                            >
                                {t('payment_methods.confirm_delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
