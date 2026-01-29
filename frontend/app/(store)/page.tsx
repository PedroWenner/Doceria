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
    image_url: string;
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
                    fetch(`${apiUrl}/products`),
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
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all outline-none"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 group-focus-within:text-gray-900 transition-colors">🔍</span>
            </div>

            {/* Banners Area */}
            <div className="overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex gap-4 w-max">
                    {/* Dark Luxury Banner */}
                    <div className="w-80 h-40 bg-gray-900 rounded-2xl shadow-xl shadow-gray-900/20 relative overflow-hidden shrink-0 flex items-center p-6 transform transition-transform hover:scale-[1.02] cursor-pointer group">
                        <div className="text-white z-10">
                            <h3 className="font-bold text-xl mb-1">Oferta do Dia</h3>
                            <p className="text-sm text-gray-300 mb-4 font-medium">Bolos com 20% OFF</p>
                            <button className="bg-white text-gray-900 px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-gray-100 transition-colors">Ver Agora</button>
                        </div>
                        <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12 group-hover:rotate-6 transition-transform duration-500">🍰</div>
                    </div>

                    {/* Light/Clean Banner */}
                    <div className="w-80 h-40 bg-white border border-gray-100 rounded-2xl shadow-sm relative overflow-hidden shrink-0 flex items-center p-6 transform transition-transform hover:scale-[1.02] cursor-pointer group">
                        <div className="text-gray-900 z-10">
                            <h3 className="font-bold text-xl mb-1">Novidades</h3>
                            <p className="text-sm text-gray-500 mb-4 font-medium">Prove o novo Brownie</p>
                            <button className="bg-gray-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-black transition-colors">Provat</button>
                        </div>
                        <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12 group-hover:rotate-6 transition-transform duration-500 grayscale">🍫</div>
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg text-gray-900 tracking-tight">Categorias</h2>
                    <span className="text-xs font-bold text-gray-400 cursor-pointer hover:text-gray-900 transition-colors">Ver todas</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`flex flex-col items-center gap-2 min-w-[80px] transition-transform active:scale-95 group`}
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-all border
                            ${selectedCategory === 'all'
                                ? 'bg-gray-900 text-white shadow-gray-900/20 scale-105 border-transparent'
                                : 'bg-white text-gray-400 border-gray-100 group-hover:border-gray-200'}`}>
                            🍽️
                        </div>
                        <span className={`text-xs font-bold transition-colors ${selectedCategory === 'all' ? 'text-gray-900' : 'text-gray-500'}`}>Todos</span>
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex flex-col items-center gap-2 min-w-[80px] transition-transform active:scale-95 group`}
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all border
                                ${selectedCategory === cat.id
                                    ? 'bg-gray-900 text-white shadow-gray-900/20 scale-105 border-transparent'
                                    : 'bg-white text-gray-900 border-gray-100 group-hover:border-gray-200'}`}>
                                {cat.name.charAt(0).toUpperCase()}
                            </div>
                            <span className={`text-xs font-bold transition-colors ${selectedCategory === cat.id ? 'text-gray-900' : 'text-gray-500'}`}>{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Product List */}
            <div>
                <h2 className="font-bold text-lg text-gray-900 tracking-tight mb-4">Destaques</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            onClick={() => {
                                setSelectedProduct(product);
                                setIsModalOpen(true);
                            }}
                            className="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-200 transition-all flex gap-5 cursor-pointer active:scale-[0.98]"
                        >
                            {/* Image */}
                            <div className="w-28 h-28 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden relative border border-gray-50">
                                {getImageUrl(product.image_url) ? (
                                    <img src={getImageUrl(product.image_url)!} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-30 grayscale">🍰</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-between py-0.5">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 group-hover:text-black transition-colors">{product.name}</h3>
                                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{product.description}</p>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <div>
                                        <span className="text-gray-900 font-bold text-sm">R$</span>
                                        <span className="text-gray-900 font-black text-lg ml-0.5">{parseFloat(product.price).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(product);
                                        }}
                                        className="h-9 px-4 rounded-lg bg-gray-100 text-gray-900 text-sm font-bold flex items-center gap-1 hover:bg-gray-900 hover:text-white transition-all shadow-sm">
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
                        <h3 className="font-bold text-gray-900 text-lg">Nenhum prato aqui</h3>
                        <p className="text-sm text-gray-500">Tente selecionar outra categoria.</p>
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
