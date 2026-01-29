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

            {/* Search Bar - Sticky on scroll could be nice but lets keep simple first */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Buscar em SweetStore..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-0 shadow-sm text-brand-choco placeholder-brand-choco/40 focus:ring-2 focus:ring-brand-pink/50 outline-none transition-all"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-brand-choco/40">🔍</span>
            </div>

            {/* Banners Area (Mockup) */}
            <div className="overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex gap-4 w-max">
                    <div className="w-80 h-40 bg-gradient-to-r from-brand-pink to-brand-gold rounded-2xl shadow-lg relative overflow-hidden shrink-0 flex items-center p-6 transform transition-transform hover:scale-[1.02] cursor-pointer">
                        <div className="text-white z-10">
                            <h3 className="font-bold text-xl mb-1 drop-shadow-sm">Oferta do Dia</h3>
                            <p className="text-sm opacity-90 mb-3 drop-shadow-sm">Bolos com 20% OFF</p>
                            <button className="bg-white text-brand-pink px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-white/90">Ver Agora</button>
                        </div>
                        <div className="absolute right-[-20px] bottom-[-20px] text-[100px] opacity-20 rotate-12">🍰</div>
                    </div>
                    <div className="w-80 h-40 bg-gradient-to-r from-brand-choco to-gray-800 rounded-2xl shadow-lg relative overflow-hidden shrink-0 flex items-center p-6 transform transition-transform hover:scale-[1.02] cursor-pointer">
                        <div className="text-white z-10">
                            <h3 className="font-bold text-xl mb-1 drop-shadow-sm">Novidades</h3>
                            <p className="text-sm opacity-90 mb-3 drop-shadow-sm">Prove o novo Brownie</p>
                            <button className="bg-white text-brand-choco px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-white/90">Ver Agora</button>
                        </div>
                        <div className="absolute right-[-20px] bottom-[-20px] text-[100px] opacity-20 rotate-12">🍫</div>
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg text-brand-choco">Categorias</h2>
                    <span className="text-xs font-bold text-brand-pink cursor-pointer hover:underline">Ver todas</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`flex flex-col items-center gap-2 min-w-[80px] transition-transform active:scale-95 group`}
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-all group-hover:shadow-md
                            ${selectedCategory === 'all' ? 'bg-brand-pink text-white shadow-brand-pink/30 scale-105' : 'bg-white text-gray-400'}`}>
                            🍽️
                        </div>
                        <span className={`text-xs font-bold transition-colors ${selectedCategory === 'all' ? 'text-brand-pink' : 'text-gray-500'}`}>Todos</span>
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex flex-col items-center gap-2 min-w-[80px] transition-transform active:scale-95 group`}
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all border border-transparent group-hover:shadow-md
                                ${selectedCategory === cat.id ? 'bg-brand-pink text-white shadow-brand-pink/30 scale-105' : 'bg-white text-brand-choco border-gray-100'}`}>
                                {/* If category had image/icon, show here. Using first letter/emoji fallback */}
                                {cat.name.charAt(0).toUpperCase()}
                            </div>
                            <span className={`text-xs font-bold transition-colors ${selectedCategory === cat.id ? 'text-brand-pink' : 'text-gray-500'}`}>{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Product List */}
            <div>
                <h2 className="font-bold text-lg text-brand-choco mb-4">Destaques</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            onClick={() => {
                                setSelectedProduct(product);
                                setIsModalOpen(true);
                            }}
                            className="group bg-white p-3 rounded-2xl border border-gray-50 shadow-sm hover:shadow-md hover:border-brand-pink/10 transition-all flex gap-4 cursor-pointer active:scale-[0.98]"
                        >
                            {/* Image - Left Side on Mobile */}
                            <div className="w-28 h-28 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden relative">
                                {getImageUrl(product.image_url) ? (
                                    <img src={getImageUrl(product.image_url)!} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl bg-brand-cream/30 text-brand-choco/20">🍰</div>
                                )}
                                {/* Discount Badge Example */}
                                {/* <div className="absolute top-0 left-0 bg-brand-pink text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-10">
                                    Novidade
                                </div> */}
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <h3 className="font-bold text-brand-choco text-base leading-tight mb-1 group-hover:text-brand-pink transition-colors">{product.name}</h3>
                                    <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{product.description}</p>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <div>
                                        <span className="text-brand-choco font-bold text-sm">R$</span>
                                        <span className="text-brand-choco font-black text-lg ml-0.5">{parseFloat(product.price).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(product);
                                        }}
                                        className="h-8 px-3 rounded-lg bg-brand-gold/10 text-brand-choco text-sm font-bold flex items-center gap-1 hover:bg-brand-gold hover:text-white transition-colors">
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <span className="text-6xl mb-4 grayscale">🍽️</span>
                        <h3 className="font-bold text-brand-choco text-lg">Nenhum prato aqui</h3>
                        <p className="text-sm">Tente selecionar outra categoria.</p>
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
