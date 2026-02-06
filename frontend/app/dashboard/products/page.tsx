'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import Cookies from 'js-cookie';
import { useLanguage } from '@/app/context/LanguageContext';
import { formatCurrency, parseCurrency, displayCurrency } from '@/app/utils/formatters';
import toast from 'react-hot-toast';
import {
    Package,
    AlertTriangle,
    Tag,
    Plus,
    Search,
    Filter,
    Pencil,
    Trash2,
    Image as ImageIcon,
    X,
    Check,
    ChevronDown
} from 'lucide-react';
import Pagination from '@/app/components/Pagination';

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
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 10 });
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
    const [searchTerm, setSearchTerm] = useState('');

    // Quick Category Creation State
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isSavingCategory, setIsSavingCategory] = useState(false);

    // Stats
    const totalProducts = meta.total;
    const lowStockCount = products.filter(p => p.stock_quantity <= p.min_stock_level && p.status === 'active').length;
    const activeDiscountsCount = products.reduce((acc, p) => acc + (p.discounts?.length || 0), 0);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const fetchProducts = async (page = 1) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${apiUrl}/products?page=${page}`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const response = await res.json();
                setProducts(response.data.data);
                setMeta(prev => ({
                    ...prev,
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    per_page: response.data.per_page
                }));
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
            const res = await fetch(`${apiUrl}/payment-methods`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                const response = await res.json();
                setPaymentMethods(response.data);
            } else {
                console.error('Failed response:', res.status);
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

            if (formData.discounts.length === 0) {
                data.append('clear_discounts', '1');
            }

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

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        setIsSavingCategory(true);
        try {
            const res = await fetch(`${apiUrl}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: newCategoryName })
            });

            if (res.ok) {
                const response = await res.json();
                const newCat = response.data;
                setCategories(prev => [...prev, newCat]);
                setFormData(prev => ({ ...prev, category_id: newCat.id.toString() }));
                setIsCreatingCategory(false);
                setNewCategoryName('');
                toast.success('Categoria criada!');
            } else {
                toast.error('Erro ao criar categoria');
            }
        } catch (error) {
            toast.error('Erro de conexão');
        } finally {
            setIsSavingCategory(false);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{t('products.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t('products.subtitle')}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm"
                    >
                        <Plus size={20} />
                        <span>{t('products.new_product')}</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('products.total_products')}</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1">{totalProducts}</p>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                        <Package size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('products.low_stock')}</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1">{lowStockCount}</p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg text-amber-600 dark:text-amber-500">
                        <AlertTriangle size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('products.active_discounts')}</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1">{activeDiscountsCount}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg text-emerald-600 dark:text-emerald-500">
                        <Tag size={24} />
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar - Aesthetic addition */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder={t('products.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('products.title').slice(0, -1)}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('products.category')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('products.price')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('products.stock')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">{t('common.status')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredProducts.map((product) => {
                                const isLowStock = product.stock_quantity <= product.min_stock_level;
                                return (
                                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                                                    {product.image_path ? (
                                                        <img src={`${apiUrl.replace('/api', '')}/storage/${product.image_path}`} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon size={20} className="text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-slate-100">{product.name}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-500 font-mono mt-0.5">{product.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                {product.category?.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-900 dark:text-slate-100">{displayCurrency(product.price)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.stock_quantity === 0 ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                                                    <AlertTriangle size={12} /> {t('products.out_of_stock')}
                                                </span>
                                            ) : isLowStock ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                                                    <AlertTriangle size={12} /> {t('products.low_stock')} ({product.stock_quantity})
                                                </span>
                                            ) : (
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {product.stock_quantity} un
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${product.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleOpenModal(product)}
                                                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {products.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={24} className="text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">{t('products.no_products')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('products.no_products_hint')}</p>
                        </div>
                    )}
                </div>
                <Pagination
                    currentPage={meta.current_page}
                    lastPage={meta.last_page}
                    total={meta.total}
                    perPage={meta.per_page}
                    onPageChange={fetchProducts}
                />
            </div>

            {/* Modal */}
            {/* Quick Category Creation Modal */}
            {isCreatingCategory && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-[2px]">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 p-6 animate-scaleIn">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">{t('products.new_category') || 'Nova Categoria'}</h3>
                        <form onSubmit={handleCreateCategory}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('common.name')}</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        required
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Ex: Bebidas"
                                    />
                                </div>
                                <div className="flex gap-3 justify-end pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setIsCreatingCategory(false); setNewCategoryName(''); }}
                                        className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newCategoryName.trim() || isSavingCategory}
                                        className="px-4 py-2 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSavingCategory ? <LoadingSpinner /> : 'Criar'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-scaleIn">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{editingProduct ? t('products.edit_product') : t('products.new_product')}</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto p-6 flex-1 bg-white dark:bg-slate-950">
                            <form id="productForm" onSubmit={handleSave} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
                                    {/* Image Upload */}
                                    <div>
                                        <div className="w-full aspect-square rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer relative overflow-hidden group">
                                            {formData.image ? (
                                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${URL.createObjectURL(formData.image)})` }} />
                                            ) : editingProduct?.image_path ? (
                                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${apiUrl.replace('/api', '')}/storage/${editingProduct.image_path})` }} />
                                            ) : (
                                                <>
                                                    <ImageIcon size={32} className="mb-2" />
                                                    <span className="text-xs font-medium">{t('products.upload_image')}</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFormData({ ...formData, image: e.target.files?.[0] || null })} />
                                        </div>
                                    </div>

                                    {/* Fields */}
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('common.name')}</label>
                                            <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 dark:focus:border-transparent outline-none transition-all"
                                                placeholder={t('common.name')} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('products.sku')}</label>
                                            <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none transition-all font-mono text-sm"
                                                placeholder="CODE-00" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('common.status')}</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none appearance-none cursor-pointer"
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'draft' })}
                                                >
                                                    <option value="active">Ativo</option>
                                                    <option value="draft">Rascunho</option>
                                                </select>
                                                <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('products.category')}</label>
                                            <div className="relative">
                                                <select required className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none appearance-none cursor-pointer"
                                                    value={formData.category_id}
                                                    onChange={e => {
                                                        if (e.target.value === 'NEW') setIsCreatingCategory(true);
                                                        else setFormData({ ...formData, category_id: e.target.value });
                                                    }}
                                                >
                                                    <option value="">{t('products.select_category')}</option>
                                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    <option value="NEW" className="font-bold text-indigo-600 bg-indigo-50 dark:bg-slate-800 dark:text-indigo-400">
                                                        + {t('products.new_category') || 'Criar Nova Categoria'}
                                                    </option>
                                                </select>
                                                <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('common.description')}</label>
                                            <textarea className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none resize-none h-24"
                                                placeholder={t('products.details_placeholder')} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                                {/* Pricing Grid */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
                                        <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"><Tag size={14} /></div>
                                        {t('products.price_stock_section')}
                                    </h3>
                                    <div className="grid grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('products.price')} (R$)</label>
                                            <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 font-bold focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none"
                                                placeholder="0,00" value={formData.price} onChange={e => setFormData({ ...formData, price: formatCurrency(e.target.value) })} />
                                        </div>
                                        {stockSettings.enabled && (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('products.stock')}</label>
                                                    <input required type="number" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none"
                                                        value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('products.min_stock')}</label>
                                                    <input required type="number" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none"
                                                        value={formData.min_stock_level} onChange={e => setFormData({ ...formData, min_stock_level: e.target.value })} />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Discounts Section - Restored */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                                            <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"><Tag size={14} /></div>
                                            {t('products.discounts_section')}
                                        </h3>
                                        <button type="button" onClick={handleAddDiscount} disabled={formData.discounts.length >= paymentMethods.length}
                                            className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1">
                                            <Plus size={14} /> {t('products.add_rule')} ({paymentMethods.length})
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {formData.discounts.length === 0 ? (
                                            <div className="text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 text-sm">
                                                {t('products.no_discounts')}
                                            </div>
                                        ) : (
                                            formData.discounts.map((discount, index) => (
                                                <div key={index} className="flex gap-3 items-center animate-slideDown">
                                                    <div className="relative flex-1">
                                                        <select required className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none appearance-none cursor-pointer"
                                                            value={discount.payment_method_id} onChange={(e) => handleDiscountChange(index, 'payment_method_id', Number(e.target.value))}>
                                                            <option value={0}>{t('products.select_method')}</option>
                                                            {paymentMethods.map(pm => {
                                                                if (formData.discounts.some((d, i) => d.payment_method_id === pm.id && i !== index)) return null;
                                                                return <option key={pm.id} value={pm.id}>{pm.name}</option>
                                                            })}
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                                                    </div>
                                                    <div className="relative w-28">
                                                        <input type="number" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none pr-8 font-bold"
                                                            value={discount.percentage} onChange={(e) => handleDiscountChange(index, 'percentage', Number(e.target.value))} min="0" max="100" step="0.1" />
                                                        <span className="absolute right-3 top-3 text-slate-400 text-xs font-bold">%</span>
                                                    </div>
                                                    <button type="button" onClick={() => handleRemoveDiscount(index)} className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{t('common.cancel')}</button>
                            <button form="productForm" type="submit" disabled={isSaving} className="px-6 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm disabled:opacity-70 disabled:cursor-wait flex items-center gap-2">
                                {isSaving ? <LoadingSpinner /> : <><Check size={18} /> {t('common.save')}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
