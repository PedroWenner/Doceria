'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    image_url: string;
    category_id: number;
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, delta: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load from LocalStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('sweet_cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save to LocalStorage whenever items change
    useEffect(() => {
        localStorage.setItem('sweet_cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: Product, quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                // Side effect removed from here
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            // Side effect removed from here
            return [...prev, { product, quantity }];
        });

        // Trigger toast after state update scheduling
        // Ideally we check if it existed before, but for now generic success message or simple logic
        // To be precise we can check 'items' but 'items' might be stale inside callback if we used functional update?
        // Actually, let's use the 'items' from closure since we re-render on change.
        const existing = items.find(item => item.product.id === product.id);
        if (existing) {
            toast.success(`+${quantity} ${product.name}`);
        } else {
            toast.success(`${product.name} adicionado!`);
        }
    };

    const removeFromCart = (productId: number) => {
        setItems(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: number, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const clearCart = () => {
        setItems([]);
    };

    const cartTotal = items.reduce((total, item) => {
        return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
