'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

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
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');

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

    // Grouping for "All" view or showing filtered
    // Let's implement a simple list for now

    if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="pb-8">
            {/* Banner / Welcome */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-brand-choco mb-1">Que bom te ver! 👋</h1>
                <p className="text-gray-500 text-sm">O que vamos comer hoje?</p>
            </div>

            {/* Categories Pills */}
            <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors
                        ${selectedCategory === 'all'
                            ? 'bg-brand-pink text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-100'}`}
                >
                    Todos
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors
                            ${selectedCategory === cat.id
                                ? 'bg-brand-pink text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-100'}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                        {/* Image */}
                        <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                            {product.image_url ? (
                                <img src={`${apiUrl.replace('/api', '')}/storage/${product.image_url}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">🍰</div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-brand-choco line-clamp-1">{product.name}</h3>
                                <p className="text-gray-400 text-xs line-clamp-2 mt-1">{product.description}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-brand-pink font-bold">R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}</span>
                                <button className="w-8 h-8 rounded-full bg-brand-gold/20 text-brand-choco flex items-center justify-center hover:bg-brand-gold/40 transition-colors">
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    Nenhum produto encontrado nesta categoria. 😢
                </div>
            )}
        </div>
    );
}
