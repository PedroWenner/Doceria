'use client';

import { useState, useEffect } from 'react';
import GlassCard from '@/app/components/GlassCard';
import Cookies from 'js-cookie';
import { useLanguage } from '@/app/context/LanguageContext';
import { formatCurrency, parseCurrency, displayCurrency } from '@/app/utils/formatters';

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    stock_quantity: number;
    min_stock_level: number;
    sku: string;
    status: 'active' | 'draft';
    image_path: string | null;
    category: { id: number; name: string };
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useLanguage();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = Cookies.get('auth_token');

    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        min_stock_level: '5',
        sku: '',
        status: 'active',
        category_id: '',
        image: null as File | null
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${apiUrl}/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const response = await res.json();
                // response.data is the paginator, response.data.data are the items
                setProducts(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${apiUrl}/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const response = await res.json();
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const handleOpenModal = (product: Product | null = null) => {
        setEditingProduct(product);
        if (product) {
            setFormData({
                name: product.name,
                description: product.description || '',
                price: formatCurrency((Number(product.price) * 100).toFixed(0)), // Convert float to integer string then mask
                stock_quantity: product.stock_quantity.toString(),
                min_stock_level: product.min_stock_level.toString(),
                sku: product.sku,
                status: product.status,
                category_id: product.category.id.toString(), // Simplified. Ideally get ID from relation. Note: API response structure might need adjustment.
                image: null
            });
        } else {
            setFormData({
                name: '',
                description: '',
                price: '',
                stock_quantity: '',
                min_stock_level: '5',
                sku: '',
                status: 'active',
                category_id: '',
                image: null
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const url = editingProduct
                ? `${apiUrl}/products/${editingProduct.id}?_method=PUT` // Laravel method spoofing for FormData PUT
                : `${apiUrl}/products`;

            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', parseCurrency(formData.price)); // Send raw float to API
            data.append('stock_quantity', formData.stock_quantity);
            data.append('min_stock_level', formData.min_stock_level);
            data.append('sku', formData.sku);
            data.append('status', formData.status);
            data.append('category_id', formData.category_id);
            if (formData.image) {
                data.append('image', formData.image);
            }

            const res = await fetch(url, {
                method: 'POST', // Always POST for FormData with Files
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: data
            });

            if (res.ok) {
                await fetchProducts();
                setIsModalOpen(false);
            } else {
                const err = await res.json();
                alert('Error saving product: ' + JSON.stringify(err));
            }
        } catch (error) {
            console.error('Save failed', error);
        } finally {
            setIsSaving(false);
        }
    };

    const getStockStatus = (stock: number, min: number) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-200 text-red-800' };
        if (stock <= min) return { label: 'Low Stock', color: 'bg-yellow-200 text-yellow-800' };
        return { label: 'In Stock', color: 'bg-green-200 text-green-800' };
    };

    if (isLoading) return <div className="text-brand-choco">{t('common.loading')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-choco">{t('products.title')}</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-brand-choco text-brand-cream px-4 py-2 rounded-xl font-bold hover:bg-brand-choco/90 transition-all shadow-lg"
                >
                    {t('products.new_product')}
                </button>
            </div>

            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-brand-pink/20 text-brand-choco uppercase text-sm font-bold">
                            <tr>
                                <th className="px-6 py-4">{t('common.image')}</th>
                                <th className="px-6 py-4">{t('common.name')}</th>
                                <th className="px-6 py-4">{t('products.category')}</th>
                                <th className="px-6 py-4">{t('products.price')}</th>
                                <th className="px-6 py-4">{t('products.stock')}</th>
                                <th className="px-6 py-4">{t('common.status')}</th>
                                <th className="px-6 py-4 text-center">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-choco/10">
                            {products.map(product => {
                                const stockStatus = getStockStatus(product.stock_quantity, product.min_stock_level);
                                return (
                                    <tr key={product.id} className="hover:bg-white/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-200 bg-cover bg-center border border-white/50"
                                                style={{ backgroundImage: product.image_path ? `url(${apiUrl.replace('/api', '')}/storage/${product.image_path})` : 'none' }}>
                                                {!product.image_path && <span className="flex items-center justify-center h-full text-xs text-brand-choco/40">{t('products.no_img')}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-brand-choco">{product.name}</div>
                                            <div className="text-xs text-brand-choco/60">{product.sku}</div>
                                        </td>
                                        <td className="px-6 py-4 text-brand-choco">{product.category?.name}</td>
                                        <td className="px-6 py-4 font-bold text-brand-choco">{displayCurrency(product.price)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${stockStatus.color}`}>
                                                {product.stock_quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${product.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                {product.status === 'active' ? t('products.active') : t('products.draft')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleOpenModal(product)}
                                                className="p-2 text-brand-pink hover:text-brand-choco hover:bg-brand-pink/10 rounded-full transition-all"
                                                title={t('common.edit')}
                                            >
                                                ✏️
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-brand-choco mb-6">{editingProduct ? t('products.edit_product') : t('products.new_product').replace('+', '')}</h2>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-brand-choco mb-1">{t('common.name')}</label>
                                    <input required type="text" className="w-full p-2 rounded-lg bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-brand-pink/50"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-brand-choco mb-1">{t('products.sku')}</label>
                                    <input required type="text" className="w-full p-2 rounded-lg bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-brand-pink/50"
                                        value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-brand-choco mb-1">{t('products.category')}</label>
                                    <select required className="w-full p-2 rounded-lg bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-brand-pink/50"
                                        value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                                        <option value="">{t('products.select_category')}</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-brand-choco mb-1">{t('products.price')}</label>
                                    <input
                                        required
                                        type="text"
                                        maxLength={15}
                                        placeholder="R$ 0,00"
                                        className="w-full p-2 rounded-lg bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-brand-pink/50"
                                        value={formData.price}
                                        onChange={e => {
                                            const masked = formatCurrency(e.target.value);
                                            setFormData({ ...formData, price: masked });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-brand-choco mb-1">{t('products.stock')}</label>
                                    <input required type="number" className="w-full p-2 rounded-lg bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-brand-pink/50"
                                        value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-brand-choco mb-1">{t('products.min_stock')}</label>
                                    <input required type="number" className="w-full p-2 rounded-lg bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-brand-pink/50"
                                        value={formData.min_stock_level} onChange={e => setFormData({ ...formData, min_stock_level: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('common.status')}</label>
                                <select className="w-full p-2 rounded-lg bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-brand-pink/50"
                                    value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="active">{t('products.active')}</option>
                                    <option value="draft">{t('products.draft')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('common.description')}</label>
                                <textarea className="w-full p-2 rounded-lg bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-brand-pink/50" rows={3}
                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('common.image')}</label>
                                <input type="file" accept="image/*" className="w-full text-sm text-brand-choco file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-pink/20 file:text-brand-choco hover:file:bg-brand-pink/30"
                                    onChange={e => setFormData({ ...formData, image: e.target.files ? e.target.files[0] : null })} />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-brand-choco/60 hover:bg-white/40 font-bold transition-colors">
                                    {t('common.cancel')}
                                </button>
                                <button type="submit" disabled={isSaving}
                                    className="px-6 py-2 rounded-lg bg-brand-choco text-brand-cream hover:bg-brand-choco/90 font-bold transition-colors disabled:opacity-50 shadow-md">
                                    {isSaving ? t('common.saving') : t('common.save')}
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
