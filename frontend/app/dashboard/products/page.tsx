'use client';

import { useState, useEffect } from 'react';
import GlassCard from '@/app/components/GlassCard';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import Cookies from 'js-cookie';
import { useLanguage } from '@/app/context/LanguageContext';
import { formatCurrency, parseCurrency, displayCurrency } from '@/app/utils/formatters';
import toast from 'react-hot-toast';

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
    discounts: ProductDiscount[];
}

interface ProductDiscount {
    id?: number;
    payment_method_id: number;
    percentage: number;
    payment_method?: { name: string; slug: string };
}

interface PaymentMethod {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useLanguage();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = Cookies.get('admin_token');

    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
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
        image: null as File | null,
        discounts: [] as { payment_method_id: number; percentage: number }[]
    });
    const [isSaving, setIsSaving] = useState(false);

    const [stockSettings, setStockSettings] = useState({ enabled: true, global_min: 5 });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchPaymentMethods();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${apiUrl}/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const response = await res.json();
                setStockSettings({
                    enabled: response.data.enable_stock_control ?? true,
                    global_min: response.data.global_min_stock || 5
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${apiUrl}/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const response = await res.json();
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

    const fetchPaymentMethods = async () => {
        try {
            const res = await fetch(`${apiUrl}/payment-methods/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const response = await res.json();
                setPaymentMethods(response.data.filter((m: PaymentMethod) => m.is_active));
            }
        } catch (error) {
            console.error('Failed to fetch payment methods', error);
        }
    };

    const handleOpenModal = (product: Product | null = null) => {
        setEditingProduct(product);
        if (product) {
            setFormData({
                name: product.name,
                description: product.description || '',
                price: formatCurrency((Number(product.price) * 100).toFixed(0)),
                stock_quantity: product.stock_quantity.toString(),
                min_stock_level: product.min_stock_level.toString(),
                sku: product.sku,
                status: product.status,
                category_id: product.category.id.toString(),
                image: null,
                discounts: product.discounts ? product.discounts.map(d => ({
                    payment_method_id: d.payment_method_id,
                    percentage: Number(d.percentage)
                })) : []
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
                image: null,
                discounts: []
            });
        }
        setIsModalOpen(true);
    };

    const handleAddDiscount = () => {
        setFormData(prev => ({
            ...prev,
            discounts: [...prev.discounts, { payment_method_id: 0, percentage: 5 }]
        }));
    };

    const handleRemoveDiscount = (index: number) => {
        setFormData(prev => ({
            ...prev,
            discounts: prev.discounts.filter((_, i) => i !== index)
        }));
    };

    const handleDiscountChange = (index: number, field: 'payment_method_id' | 'percentage', value: number) => {
        setFormData(prev => {
            const newDiscounts = [...prev.discounts];
            newDiscounts[index] = { ...newDiscounts[index], [field]: value };
            return { ...prev, discounts: newDiscounts };
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const url = editingProduct
                ? `${apiUrl}/products/${editingProduct.id}?_method=PUT`
                : `${apiUrl}/products`;

            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', parseCurrency(formData.price));

            if (stockSettings.enabled) {
                data.append('stock_quantity', formData.stock_quantity);
                data.append('min_stock_level', formData.min_stock_level);
            } else {
                data.append('stock_quantity', '0');
                data.append('min_stock_level', '0');
            }

            data.append('sku', formData.sku);
            data.append('status', formData.status);
            data.append('category_id', formData.category_id);
            if (formData.image) {
                data.append('image', formData.image);
            }

            // Append Discounts
            const selectedMethodIds = formData.discounts.map(d => d.payment_method_id).filter(id => id > 0);
            const uniqueIds = new Set(selectedMethodIds);
            if (selectedMethodIds.length !== uniqueIds.size) {
                toast.error('Não é permitido duplicar o meio de pagamento nos descontos.');
                setIsSaving(false);
                return;
            }

            formData.discounts.forEach((discount, index) => {
                if (discount.payment_method_id > 0) {
                    data.append(`discounts[${index}][payment_method_id]`, discount.payment_method_id.toString());
                    data.append(`discounts[${index}][percentage]`, discount.percentage.toString());
                }
            });

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: data
            });

            if (res.ok) {
                await fetchProducts();
                setIsModalOpen(false);
                toast.success('Produto salvo com sucesso!');
            } else {
                const err = await res.json();
                console.error(err);
                toast.error(`Erro ao salvar: ${err.message || 'Verifique os campos'}`);
            }
        } catch (error) {
            console.error('Save failed', error);
            toast.error('Erro de conexão ao salvar.');
        } finally {
            setIsSaving(false);
        }
    };

    const getStockStatus = (stock: number, min: number) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-200 text-red-800' };
        if (stock <= min) return { label: 'Low Stock', color: 'bg-yellow-200 text-yellow-800' };
        return { label: 'In Stock', color: 'bg-green-200 text-green-800' };
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 pb-20">
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
                                <th className="px-6 py-4 text-center">Descontos</th>
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
                                            {product.status === 'draft' && <span className="text-[10px] bg-gray-200 text-gray-700 px-1 rounded">Rascunho</span>}
                                        </td>
                                        <td className="px-6 py-4 text-brand-choco">{product.category?.name}</td>
                                        <td className="px-6 py-4 font-bold text-brand-choco">{displayCurrency(product.price)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${stockStatus.color}`}>
                                                {product.stock_quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {product.discounts && product.discounts.length > 0 ? (
                                                <div className="flex flex-col gap-1 items-center">
                                                    {product.discounts.map(d => (
                                                        <span key={d.id} className="text-xs bg-brand-pink/20 text-brand-choco px-2 py-0.5 rounded-full whitespace-nowrap">
                                                            {Number(d.percentage)}% off {d.payment_method?.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-black/30">-</span>
                                            )}
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
                    <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn">
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

                            {/* Discount Logic */}
                            <div className="border-t border-brand-gold/20 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-brand-choco">Descontos por Pagamento</label>
                                    <button
                                        type="button"
                                        onClick={handleAddDiscount}
                                        disabled={formData.discounts.length >= paymentMethods.length}
                                        className="text-xs bg-brand-pink/20 text-brand-choco px-2 py-1 rounded hover:bg-brand-pink/30 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        + Adicionar
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {formData.discounts.map((discount, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <select
                                                required
                                                value={discount.payment_method_id}
                                                onChange={(e) => handleDiscountChange(index, 'payment_method_id', Number(e.target.value))}
                                                className="flex-1 p-2 rounded-lg bg-white/50 border border-white/60 text-sm"
                                            >
                                                <option value={0}>Selecione...</option>
                                                {paymentMethods.map(pm => {
                                                    const isSelectedElsewhere = formData.discounts.some((d, i) => d.payment_method_id === pm.id && i !== index);
                                                    if (isSelectedElsewhere) return null; // Hide instead of disable
                                                    return (
                                                        <option key={pm.id} value={pm.id}>
                                                            {pm.name}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            <div className="relative w-24">
                                                <input
                                                    type="number"
                                                    value={discount.percentage}
                                                    onChange={(e) => handleDiscountChange(index, 'percentage', Number(e.target.value))}
                                                    className="w-full p-2 rounded-lg bg-white/50 border border-white/60 text-sm pr-6"
                                                    min="0" max="100" step="0.1"
                                                />
                                                <span className="absolute right-2 top-2 text-brand-choco/50 text-xs">%</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveDiscount(index)}
                                                className="text-red-500 hover:text-red-700 px-1"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    {formData.discounts.length === 0 && (
                                        <p className="text-xs text-brand-choco/50 italic">Nenhum desconto configurado.</p>
                                    )}
                                </div>
                            </div>

                            {stockSettings.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                            )}

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
