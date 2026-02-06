'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Plus, Edit2, Trash2, Tag, Search } from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import CategoryModal from '@/app/components/expenses/CategoryModal';

interface Category {
    id: number;
    name: string;
    description: string;
    color: string;
}

export default function CategoriesPage() {
    const { t } = useLanguage();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const fetchCategories = async () => {
        setLoading(true);
        const token = Cookies.get('admin_token');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/expense-categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;

        const token = Cookies.get('admin_token');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/expense-categories/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success(t('financial.delete_success'));
                fetchCategories();
            } else {
                const data = await response.json();
                toast.error(data.message || t('financial.delete_category_error'));
            }
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {t('financial.categories')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gerencie as categorias de despesas do sistema.
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 font-medium"
                >
                    <Plus size={20} />
                    {t('financial.new_category')}
                </button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

                {/* Filters */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('common.actions')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="p-12 text-center text-slate-400">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {filteredCategories.map(category => (
                            <div
                                key={category.id}
                                className="group relative bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:border-blue-500 dark:hover:border-blue-500/50 transition-all hover:shadow-md"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
                                        style={{ backgroundColor: category.color || '#94a3b8' }}
                                    >
                                        <Tag size={20} />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{category.name}</h3>
                                {category.description && (
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 line-clamp-2">
                                        {category.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredCategories.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        Nenhuma categoria encontrada.
                    </div>
                )}
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchCategories}
                category={selectedCategory}
            />
        </div>
    );
}
