'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    image_url: string;
    category_id: number;
}

interface ProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    getImageUrl: (path: string | null) => string | null;
}

export default function ProductModal({ product, isOpen, onClose, getImageUrl }: ProductModalProps) {
    const [quantity, setQuantity] = useState(1);
    const { addToCart, items, updateQuantity } = useCart();
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen && product) {
            const existingItem = items.find(item => item.product.id === product.id);
            setQuantity(existingItem ? existingItem.quantity : 1);

            setIsClosing(false);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen, product, items]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300); // Animation duration
    };

    const handleAddToCart = () => {
        if (product) {
            const existingItem = items.find(item => item.product.id === product.id);
            if (existingItem) {
                const delta = quantity - existingItem.quantity;
                if (delta !== 0) {
                    updateQuantity(product.id, delta);
                }
            } else {
                addToCart(product, quantity);
            }
            handleClose();
        }
    };

    if (!isOpen && !isClosing) return null;
    if (!product) return null;

    const totalPrice = (parseFloat(product.price) * quantity).toFixed(2).replace('.', ',');

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center md:items-center md:p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            ></div>

            {/* Modal Content */}
            <div className={`
                relative bg-white w-full h-full md:h-auto md:max-h-[85vh] md:w-[500px] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden
                ${isClosing ? 'animate-slideDown' : 'animate-slideUp'}
            `}>

                {/* Close Button (Absolute) */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/20 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/30 transition-colors"
                >
                    ✕
                </button>

                {/* Header Image */}
                <div className="h-64 md:h-72 bg-gray-100 relative shrink-0">
                    {getImageUrl(product.image_url) ? (
                        <img
                            src={getImageUrl(product.image_url)!}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl bg-brand-cream/30">🍰</div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent md:from-white/0"></div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 -mt-6 relative z-10 bg-white md:bg-transparent md:mt-0 rounded-t-3xl md:rounded-none">
                    <h2 className="text-2xl font-bold text-brand-choco mb-2">{product.name}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.description}</p>

                    <div className="mb-6">
                        <span className="text-brand-pink font-bold text-xl">R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}</span>
                    </div>

                    {/* Observation Input (Mockup for now) */}
                    <div className="space-y-2 mb-8">
                        <label className="text-sm font-bold text-gray-700">Alguma observação?</label>
                        <textarea
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-pink/20 outline-none resize-none"
                            placeholder="Ex: Tirar a cebola, caprichar no molho..."
                            rows={3}
                        ></textarea>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 md:p-6 border-t border-gray-50 bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        {/* Quantity */}
                        <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-2 px-3">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className={`text-xl font-bold w-6 h-6 flex items-center justify-center ${quantity === 1 ? 'text-gray-300' : 'text-brand-choco'}`}
                                disabled={quantity === 1}
                            >-</button>
                            <span className="text-lg font-bold w-6 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="text-brand-pink text-xl font-bold w-6 h-6 flex items-center justify-center"
                            >+</button>
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 bg-brand-pink text-white h-12 rounded-xl font-bold flex items-center justify-between px-6 shadow-lg shadow-brand-pink/20 hover:bg-brand-pink/90 active:scale-[0.98] transition-all"
                        >
                            <span>Adicionar</span>
                            <span>R$ {totalPrice}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
