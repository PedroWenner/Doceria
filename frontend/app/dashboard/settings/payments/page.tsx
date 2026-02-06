'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import Cookies from 'js-cookie';
import { useLanguage } from '@/app/context/LanguageContext';
import toast from 'react-hot-toast';
import {
    CreditCard,
    Plus,
    Trash2,
    Pencil,
    Search,
    X,
    Check,
    AlertTriangle,
    Wallet
} from 'lucide-react';
import Pagination from '@/app/components/Pagination';

interface PaymentMethod {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
}

export default function PaymentMethodsPage() {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    // Fetch Methods
    const fetchMethods = async (page = 1) => {
        try {
            setIsLoading(true);
            const res = await fetch(`${apiUrl}/payment-methods/admin?page=${page}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                const responseData = data.data;
                let items: PaymentMethod[] = [];
                let pagination = {
                    current_page: 1,
                    last_page: 1,
                    total: 0,
                    per_page: 15
                };

                if (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray(responseData.data)) {
                    items = responseData.data;
                    pagination = {
                        current_page: responseData.current_page,
                        last_page: responseData.last_page,
                        total: responseData.total,
                        per_page: responseData.per_page
                    };
                }
                else if (Array.isArray(responseData)) {
                    items = responseData;
                    pagination = {
                        current_page: 1,
                        last_page: 1,
                        total: items.length,
                        per_page: items.length
                    };
                }
                else if (data.meta) {
                    items = data.data;
                    pagination = {
                        current_page: data.meta.current_page,
                        last_page: data.meta.last_page,
                        total: data.meta.total,
                        per_page: data.meta.per_page
                    };
                }

                setMethods(items);
                setMeta(pagination);
            }
        } catch (error) {
            console.error(error);
            toast.error(t('payment_methods.load_error'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMethods();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Toggle Status
    const handleToggle = async (id: number) => {
        try {
            const res = await fetch(`${apiUrl}/payment-methods/${id}/toggle`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success(t('payment_methods.update_status_success'));
                fetchMethods(meta.current_page);
            }
        } catch (error) {
            toast.error(t('payment_methods.update_status_error'));
        }
    };

    // Delete
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
                fetchMethods(meta.current_page);
                setDeleteConfirmation({ isOpen: false, methodId: null });
            }
        } catch (error) {
            toast.error(t('payment_methods.delete_error'));
        }
    };

    // Create/Edit
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
            const methodKey = editingMethod ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: methodKey,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, slug })
            });

            if (res.ok) {
                toast.success(t('payment_methods.save_success'));
                setIsModalOpen(false);
                fetchMethods(meta.current_page);
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

    const handleNameChange = (val: string) => {
        setName(val);
        if (!editingMethod) {
            setSlug(val.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '_'));
        }
    };

    const filteredMethods = methods.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder={t('products.search_placeholder').replace('produtos', 'meios')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
            </div>

            {/* Methods Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('payment_methods.name')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('payment_methods.slug')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">{t('common.status')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredMethods.map(method => (
                                <tr key={method.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                                                <Wallet size={20} />
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-slate-100">{method.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            {method.slug}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleToggle(method.id)}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${method.is_active
                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                                }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${method.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                            {method.is_active ? t('payment_methods.active') : t('payment_methods.inactive')}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(method)}
                                                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                title={t('payment_methods.edit_method')}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(method.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                title={t('common.delete')}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredMethods.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={24} className="text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">{t('payment_methods.load_error').replace('Erro ao carregar', '')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('payment_methods.save_error').replace('Erro ao salvar', 'Nenhum meio encontrado com este termo.')}</p>
                        </div>
                    )}
                </div>
                <Pagination
                    currentPage={meta.current_page}
                    lastPage={meta.last_page}
                    total={meta.total}
                    perPage={meta.per_page}
                    onPageChange={fetchMethods}
                />
            </div>

            {/* Modal Basic (Name/Slug) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-scaleIn">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                                {editingMethod ? <Pencil size={18} /> : <Plus size={18} />}
                                {editingMethod ? t('payment_methods.edit_method') : t('payment_methods.new_method')}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

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
                                    <AlertTriangle size={12} />
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
                                    {isSaving ?
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={18} /> {t('common.save')}</>}
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
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                                <AlertTriangle size={24} className="text-rose-500" />
                                <span className="text-rose-500">{t('payment_methods.delete_title')}</span>
                            </h2>
                            <button onClick={() => setDeleteConfirmation({ isOpen: false, methodId: null })} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500 dark:text-rose-400">
                                <Trash2 size={32} />
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
