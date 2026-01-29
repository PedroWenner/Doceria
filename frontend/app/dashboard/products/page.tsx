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

    // Stats
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.stock_quantity <= p.min_stock_level && p.status === 'active').length;
    const activeDiscountsCount = products.reduce((acc, p) => acc + (p.discounts?.length || 0), 0);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchPaymentMethods();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${apiUrl}/settings`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const response = await res.json();
                setStockSettings({
                    enabled: response.data.enable_stock_control ?? true,
                    global_min: response.data.global_min_stock || 5
                });
            }
        } catch (error) { console.error('Failed to fetch settings', error); }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${apiUrl}/products`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const response = await res.json();
                setProducts(response.data.data);
            }
        } catch (error) { console.error('Failed to fetch products', error); }
        finally { setIsLoading(false); }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${apiUrl}/categories`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const response = await res.json();
                setCategories(response.data);
            }
        } catch (error) { console.error('Failed to fetch categories', error); }
    };

    const fetchPaymentMethods = async () => {
        try {
            const res = await fetch(`${apiUrl}/payment-methods/admin`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const response = await res.json();
                setPaymentMethods(response.data.filter((m: PaymentMethod) => m.is_active));
            }
        } catch (error) { console.error('Failed to fetch payment methods', error); }
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
        setFormData(prev => ({ ...prev, discounts: [...prev.discounts, { payment_method_id: 0, percentage: 5 }] }));
    };

    const handleRemoveDiscount = (index: number) => {
        setFormData(prev => ({ ...prev, discounts: prev.discounts.filter((_, i) => i !== index) }));
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
            const url = editingProduct ? `${apiUrl}/products/${editingProduct.id}?_method=PUT` : `${apiUrl}/products`;
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', parseCurrency(formData.price));
            data.append('stock_quantity', stockSettings.enabled ? formData.stock_quantity : '0');
            data.append('min_stock_level', stockSettings.enabled ? formData.min_stock_level : '0');
            data.append('sku', formData.sku);
            data.append('status', formData.status);
            data.append('category_id', formData.category_id);
            if (formData.image) data.append('image', formData.image);

            const selectedIds = formData.discounts.map(d => d.payment_method_id).filter(id => id > 0);
            if (new Set(selectedIds).size !== selectedIds.length) {
                toast.error('Não é permitido duplicar o meio de pagamento nos descontos.');
                setIsSaving(false); return;
            }

            formData.discounts.forEach((d, i) => {
                if (d.payment_method_id > 0) {
                    data.append(`discounts[${i}][payment_method_id]`, d.payment_method_id.toString());
                    data.append(`discounts[${i}][percentage]`, d.percentage.toString());
                }
            });

            const res = await fetch(url, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: data
            });

            if (res.ok) {
                await fetchProducts();
                setIsModalOpen(false);
                toast.success('Produto salvo com sucesso!');
            } else {
                const err = await res.json();
                toast.error(`Erro: ${err.message || 'Verifique os campos'}`);
            }
        } catch (error) { toast.error('Erro de conexão.'); }
        finally { setIsSaving(false); }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-brand-choco font-serif">{t('products.title')}</h1>
                    <p className="text-brand-choco/60 mt-1">Gerencie seu catálogo, estoque e preços.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-gradient-to-r from-brand-choco to-[#4a2c28] text-brand-cream px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all active:scale-95"
                >
                    {t('products.new_product')}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-6 flex items-center justify-between relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-brand-choco/60 text-sm font-bold uppercase tracking-wider">Total de Produtos</p>
                        <p className="text-4xl font-bold text-brand-choco mt-1">{totalProducts}</p>
                    </div>
                    <div className="text-5xl opacity-10 group-hover:opacity-20 transition-opacity absolute right-4 bottom-2 mb-0">🧁</div>
                </GlassCard>
                <GlassCard className="p-6 flex items-center justify-between relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-brand-choco/60 text-sm font-bold uppercase tracking-wider">Alerta de Estoque</p>
                        <p className="text-4xl font-bold text-red-600 mt-1">{lowStockCount}</p>
                    </div>
                    <div className="text-5xl opacity-10 group-hover:opacity-20 transition-opacity absolute right-4 bottom-2 mb-0">⚠️</div>
                </GlassCard>
                <GlassCard className="p-6 flex items-center justify-between relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-brand-choco/60 text-sm font-bold uppercase tracking-wider">Descontos Ativos</p>
                        <p className="text-4xl font-bold text-brand-gold mt-1">{activeDiscountsCount}</p>
                    </div>
                    <div className="text-5xl opacity-10 group-hover:opacity-20 transition-opacity absolute right-4 bottom-2 mb-0">🏷️</div>
                </GlassCard>
            </div>

            {/* Main Table Card */}
            <GlassCard className="overflow-hidden border-0 shadow-xl bg-white/40 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-brand-choco/5 text-brand-choco uppercase text-xs font-bold tracking-wider border-b border-brand-choco/10">
                            <tr>
                                <th className="px-8 py-5">Produto</th>
                                <th className="px-6 py-5">Categoria</th>
                                <th className="px-6 py-5">Preço</th>
                                <th className="px-6 py-5">Estoque</th>
                                <th className="px-6 py-5 text-center">Descontos</th>
                                <th className="px-6 py-5 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-choco/5">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-white/40 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-16 h-16 rounded-xl bg-gray-100 bg-cover bg-center shadow-sm border border-white/50 group-hover:scale-105 transition-transform duration-300"
                                                style={{ backgroundImage: product.image_path ? `url(${apiUrl.replace('/api', '')}/storage/${product.image_path})` : 'none' }}>
                                                {!product.image_path && <span className="flex items-center justify-center h-full text-lg opacity-20">📷</span>}
                                            </div>
                                            <div>
                                                <div className="font-bold text-brand-choco text-lg leading-tight">{product.name}</div>
                                                <div className="text-xs text-brand-choco/50 font-mono mt-1">{product.sku}</div>
                                                {product.status === 'draft' && <span className="inline-block mt-1 text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">Rascunho</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-brand-cream border border-brand-gold/20 rounded-lg text-sm text-brand-choco font-medium">
                                            {product.category?.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-brand-choco text-lg">{displayCurrency(product.price)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.stock_quantity === 0 ? (
                                            <span className="px-3 py-1 bg-red-100/80 text-red-800 rounded-lg text-xs font-bold border border-red-200">Esgotado</span>
                                        ) : product.stock_quantity <= product.min_stock_level ? (
                                            <span className="px-3 py-1 bg-yellow-100/80 text-yellow-800 rounded-lg text-xs font-bold border border-yellow-200">Baixo: {product.stock_quantity}</span>
                                        ) : (
                                            <span className="px-3 py-1 bg-green-100/80 text-green-800 rounded-lg text-xs font-bold border border-green-200">{product.stock_quantity} un</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 justify-center max-w-[200px] mx-auto">
                                            {product.discounts && product.discounts.length > 0 ? (
                                                product.discounts.map(d => (
                                                    <span key={d.id} className="text-[10px] bg-brand-pink text-brand-choco px-2 py-1 rounded-md font-bold shadow-sm border border-white/20">
                                                        -{Number(d.percentage)}% {d.payment_method?.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-brand-choco/20 text-xs">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleOpenModal(product)}
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-brand-choco hover:bg-brand-pink hover:text-white transition-all mx-auto active:scale-90"
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length === 0 && (
                        <div className="p-12 text-center text-brand-choco/40">
                            <p className="text-xl">Nenhum produto encontrado.</p>
                            <p className="text-sm mt-2">Clique em "Novo Produto" para começar.</p>
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Modal Pro Max */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-white/50 animate-scaleIn bg-white/80">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-brand-choco/10 flex justify-between items-center bg-white/50">
                            <div>
                                <h2 className="text-2xl font-bold text-brand-choco font-serif">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
                                <p className="text-sm text-brand-choco/60">Preencha as informações abaixo para salvar.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-black/5 hover:bg-red-100 hover:text-red-500 transition-colors flex items-center justify-center text-lg">✕</button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto p-8 space-y-8 flex-1">
                            <form id="productForm" onSubmit={handleSave} className="space-y-8">
                                {/* Section 1: Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
                                    <div className="space-y-4">
                                        <div className="w-full aspect-square rounded-2xl bg-gray-100 border-2 border-dashed border-brand-choco/20 flex flex-col items-center justify-center text-brand-choco/40 hover:bg-brand-pink/5 hover:border-brand-pink/50 transition-colors cursor-pointer relative overflow-hidden group">
                                            {formData.image ? (
                                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${URL.createObjectURL(formData.image)})` }} />
                                            ) : editingProduct?.image_path ? (
                                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${apiUrl.replace('/api', '')}/storage/${editingProduct.image_path})` }} />
                                            ) : (
                                                <>
                                                    <span className="text-4xl mb-2">📷</span>
                                                    <span className="text-xs font-bold">Upload Foto</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFormData({ ...formData, image: e.target.files?.[0] || null })} />
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="text-xs font-bold text-brand-choco uppercase tracking-wide mb-1 block">Nome do Produto</label>
                                                <input required type="text" className="w-full text-lg font-medium p-3 rounded-xl bg-white border border-brand-choco/10 focus:border-brand-pink/50 focus:ring-4 focus:ring-brand-pink/10 transition-all outline-none"
                                                    placeholder="Ex: Bolo de Cenoura" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-brand-choco uppercase tracking-wide mb-1 block">SKU</label>
                                                <input required type="text" className="w-full p-3 rounded-xl bg-white border border-brand-choco/10 focus:border-brand-pink/50 focus:ring-4 focus:ring-brand-pink/10 transition-all outline-none font-mono text-sm"
                                                    placeholder="DOC-001" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-brand-choco uppercase tracking-wide mb-1 block">Categoria</label>
                                                <select required className="w-full p-3 rounded-xl bg-white border border-brand-choco/10 focus:border-brand-pink/50 focus:ring-4 focus:ring-brand-pink/10 transition-all outline-none"
                                                    value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                                                    <option value="">Selecione...</option>
                                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs font-bold text-brand-choco uppercase tracking-wide mb-1 block">Descrição</label>
                                                <textarea className="w-full p-3 rounded-xl bg-white border border-brand-choco/10 focus:border-brand-pink/50 focus:ring-4 focus:ring-brand-pink/10 transition-all outline-none" rows={3}
                                                    placeholder="Descreva o produto com detalhes deliciosos..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-brand-choco/10" />

                                {/* Section 2: Pricing & Inventory */}
                                <div>
                                    <h3 className="text-lg font-bold text-brand-choco mb-4 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded bg-brand-gold text-white flex items-center justify-center text-xs">💰</span>
                                        Preço e Estoque
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-brand-cream/30 p-6 rounded-2xl border border-brand-gold/10">
                                        <div>
                                            <label className="text-xs font-bold text-brand-choco uppercase tracking-wide mb-1 block">Preço de Venda</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-3 text-brand-choco/40 font-bold">R$</span>
                                                <input required type="text" className="w-full p-3 pl-10 rounded-xl bg-white border border-brand-choco/10 focus:border-brand-gold/50 focus:ring-4 focus:ring-brand-gold/10 transition-all outline-none text-xl font-bold text-brand-choco"
                                                    placeholder="0,00" value={formData.price} onChange={e => setFormData({ ...formData, price: formatCurrency(e.target.value) })} />
                                            </div>
                                        </div>

                                        {stockSettings.enabled && (
                                            <>
                                                <div>
                                                    <label className="text-xs font-bold text-brand-choco uppercase tracking-wide mb-1 block">Estoque Atual</label>
                                                    <input required type="number" className="w-full p-3 rounded-xl bg-white border border-brand-choco/10 focus:border-brand-gold/50 focus:ring-4 focus:ring-brand-gold/10 transition-all outline-none"
                                                        value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-brand-choco uppercase tracking-wide mb-1 block">Mínimo (Alerta)</label>
                                                    <input required type="number" className="w-full p-3 rounded-xl bg-white border border-brand-choco/10 focus:border-brand-gold/50 focus:ring-4 focus:ring-brand-gold/10 transition-all outline-none"
                                                        value={formData.min_stock_level} onChange={e => setFormData({ ...formData, min_stock_level: e.target.value })} />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Section 3: Discounts */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-brand-choco flex items-center gap-2">
                                            <span className="w-6 h-6 rounded bg-brand-pink text-white flex items-center justify-center text-xs">🏷️</span>
                                            Descontos por Pagamento
                                        </h3>
                                        <button type="button" onClick={handleAddDiscount} disabled={formData.discounts.length >= paymentMethods.length}
                                            className="text-xs font-bold text-brand-choco bg-brand-pink/20 hover:bg-brand-pink/40 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                                            + Adicionar Regra
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {formData.discounts.length === 0 ? (
                                            <div className="text-center py-6 bg-black/5 rounded-xl border border-dashed border-brand-choco/20 text-brand-choco/40 text-sm">
                                                Nenhum desconto configurado para este produto.
                                            </div>
                                        ) : (
                                            formData.discounts.map((discount, index) => (
                                                <div key={index} className="flex gap-3 items-center animate-slideDown">
                                                    <select required className="flex-1 p-3 rounded-xl bg-white border border-brand-choco/10 focus:ring-2 focus:ring-brand-pink/30 outline-none text-brand-choco"
                                                        value={discount.payment_method_id} onChange={(e) => handleDiscountChange(index, 'payment_method_id', Number(e.target.value))}>
                                                        <option value={0}>Selecione o Meio...</option>
                                                        {paymentMethods.map(pm => {
                                                            if (formData.discounts.some((d, i) => d.payment_method_id === pm.id && i !== index)) return null;
                                                            return <option key={pm.id} value={pm.id}>{pm.name}</option>
                                                        })}
                                                    </select>
                                                    <div className="relative w-32">
                                                        <input type="number" className="w-full p-3 rounded-xl bg-white border border-brand-choco/10 focus:ring-2 focus:ring-brand-pink/30 outline-none pr-8 font-bold text-brand-choco"
                                                            value={discount.percentage} onChange={(e) => handleDiscountChange(index, 'percentage', Number(e.target.value))} min="0" max="100" step="0.1" />
                                                        <span className="absolute right-3 top-3.5 text-brand-choco/40 font-bold">%</span>
                                                    </div>
                                                    <button type="button" onClick={() => handleRemoveDiscount(index)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">🗑️</button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-brand-choco/10 bg-white/50 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-brand-choco font-bold hover:bg-black/5 transition-colors">Cancelar</button>
                            <button form="productForm" type="submit" disabled={isSaving} className="px-8 py-3 rounded-xl bg-brand-choco text-white font-bold hover:bg-brand-choco/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-wait">
                                {isSaving ? 'Salvando...' : 'Salvar Produto'}
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
