'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { useCart } from '@/app/context/CartContext';
import ProductModal from '@/app/components/ProductModal';

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    image_path: string | null;
    category_id: number;
}

interface Category {
    id: number;
    name: string;
}

export default function StoreHome() {
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // We can use the public API without token now!
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    fetch(`${apiUrl}/products?status=active&limit=all`),
                    fetch(`${apiUrl}/categories`)
                ]);

                if (prodRes.ok) {
                    const data = await prodRes.json();
                    setProducts(data.data.data || data.data); // Handle pagination or flat list
                }

                if (catRes.ok) {
                    const data = await catRes.json();
                    setCategories(data.data);
                }
            } catch (error) {
                console.error("Error fetching store data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStoreData();
    }, [apiUrl]);

    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category_id === selectedCategory);

    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${apiUrl.replace('/api', '')}/storage/${path}`;
    };

    if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="pb-8 space-y-8">

            {/* Search Bar */}
            <div className="relative group">
                <input
                    type="text"
                    placeholder="O que você deseja provar hoje?"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border shadow-sm transition-all outline-none"
                    style={{
                        backgroundColor: 'var(--store-card)',
                        borderColor: 'var(--store-border)',
                        color: 'var(--store-text)',
                    }}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl transition-colors" style={{ color: 'var(--store-text-muted)' }}>🔍</span>
            </div>

            {/* Banners Area */}
            <div className="overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex gap-4 w-max">
                    {/* Dark Luxury Banner - keep as is or theme? Lets theme it as "Primary" style */}
                    <div className="w-80 h-40 rounded-2xl shadow-xl relative overflow-hidden shrink-0 flex items-center p-6 transform transition-transform hover:scale-[1.02] cursor-pointer group"
                        style={{ backgroundColor: 'var(--store-primary)', color: 'var(--store-primary-fg)' }}>
                        <div className="z-10">
                            <h3 className="font-bold text-xl mb-1">Oferta do Dia</h3>
                            <p className="text-sm mb-4 font-medium opacity-80">Bolos com 20% OFF</p>
                            <button className="px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-colors"
                                style={{ backgroundColor: 'var(--store-card)', color: 'var(--store-text)' }}>Ver Agora</button>
                        </div>
                        <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12 group-hover:rotate-6 transition-transform duration-500">🍰</div>
                    </div>

                    {/* Light/Clean Banner */}
                    <div className="w-80 h-40 border rounded-2xl shadow-sm relative overflow-hidden shrink-0 flex items-center p-6 transform transition-transform hover:scale-[1.02] cursor-pointer group"
                        style={{
                            backgroundColor: 'var(--store-card)',
                            borderColor: 'var(--store-border)',
                            color: 'var(--store-text)'
                        }}>
                        <div className="z-10">
                            <h3 className="font-bold text-xl mb-1">Novidades</h3>
                            <p className="text-sm mb-4 font-medium" style={{ color: 'var(--store-text-muted)' }}>Prove o novo Brownie</p>
                            <button className="px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-colors"
                                style={{ backgroundColor: 'var(--store-primary)', color: 'var(--store-primary-fg)' }}>Provar</button>
                        </div>
                        <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12 group-hover:rotate-6 transition-transform duration-500 grayscale">🍫</div>
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg tracking-tight" style={{ color: 'var(--store-text)' }}>Categorias</h2>
                    <span className="text-xs font-bold cursor-pointer hover:opacity-80 transition-colors" style={{ color: 'var(--store-text-muted)' }}>Ver todas</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`flex flex-col items-center gap-2 min-w-[80px] transition-transform active:scale-95 group`}
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-all border
                            ${selectedCategory === 'all'
                                ? 'shadow-lg scale-105 border-transparent'
                                : 'group-hover:opacity-80'}`}
                            style={{
                                backgroundColor: selectedCategory === 'all' ? 'var(--store-primary)' : 'var(--store-card)',
                                color: selectedCategory === 'all' ? 'var(--store-primary-fg)' : 'var(--store-text-muted)',
                                borderColor: selectedCategory === 'all' ? 'transparent' : 'var(--store-border)'
                            }}
                        >
                            🍽️
                        </div>
                        <span className={`text-xs font-bold transition-colors`} style={{ color: selectedCategory === 'all' ? 'var(--store-text)' : 'var(--store-text-muted)' }}>Todos</span>
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex flex-col items-center gap-2 min-w-[80px] transition-transform active:scale-95 group`}
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all border
                                ${selectedCategory === cat.id
                                    ? 'shadow-lg scale-105 border-transparent'
                                    : 'group-hover:opacity-80'}`}
                                style={{
                                    backgroundColor: selectedCategory === cat.id ? 'var(--store-primary)' : 'var(--store-card)',
                                    color: selectedCategory === cat.id ? 'var(--store-primary-fg)' : 'var(--store-text)',
                                    borderColor: selectedCategory === cat.id ? 'transparent' : 'var(--store-border)'
                                }}
                            >
                                {cat.name.charAt(0).toUpperCase()}
                            </div>
                            <span className={`text-xs font-bold transition-colors`} style={{ color: selectedCategory === cat.id ? 'var(--store-text)' : 'var(--store-text-muted)' }}>{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Product List */}
            <div>
                <h2 className="font-bold text-lg tracking-tight mb-4" style={{ color: 'var(--store-text)' }}>Destaques</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            onClick={() => {
                                setSelectedProduct(product);
                                setIsModalOpen(true);
                            }}
                            className="group p-4 rounded-2xl border shadow-sm hover:shadow-lg transition-all flex gap-5 cursor-pointer active:scale-[0.98]"
                            style={{
                                backgroundColor: 'var(--store-card)',
                                borderColor: 'var(--store-border)'
                            }}
                        >
                            {/* Image */}
                            <div className="w-28 h-28 rounded-xl flex-shrink-0 overflow-hidden relative border"
                                style={{ backgroundColor: 'var(--store-secondary)', borderColor: 'var(--store-border)' }}>
                                {getImageUrl(product.image_path) ? (
                                    <img src={getImageUrl(product.image_path)!} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-30 grayscale">🍰</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-between py-0.5">
                                <div>
                                    <h3 className="font-bold text-base leading-tight mb-1 transition-colors" style={{ color: 'var(--store-text)' }}>{product.name}</h3>
                                    <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--store-text-muted)' }}>{product.description}</p>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <div>
                                        <span className="font-bold text-sm" style={{ color: 'var(--store-text)' }}>R$</span>
                                        <span className="font-black text-lg ml-0.5" style={{ color: 'var(--store-text)' }}>{parseFloat(product.price).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(product);
                                        }}
                                        className="h-9 px-4 rounded-lg text-sm font-bold flex items-center gap-1 transition-all shadow-sm"
                                        style={{ backgroundColor: 'var(--store-secondary)', color: 'var(--store-text)' }}
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <span className="text-6xl mb-4 grayscale">🍽️</span>
                        <h3 className="font-bold text-lg" style={{ color: 'var(--store-text)' }}>Nenhum prato aqui</h3>
                        <p className="text-sm" style={{ color: 'var(--store-text-muted)' }}>Tente selecionar outra categoria.</p>
                    </div>
                )}
            </div>

            <ProductModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                getImageUrl={getImageUrl}
            />
        </div>
    );
}
