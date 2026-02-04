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
    discounts?: {
        id?: number;
        payment_method_id: number;
        percentage: number;
        payment_method?: { name: string; slug: string };
    }[];
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

    // Load from SessionStorage on mount
    useEffect(() => {
        // Migration: Check if localStorage has old data, if so, ignore it or move it? 
        // User asked to clear data when closing browser, so we should IGNORE old persistent data.
        // We will cleanup localStorage to avoid confusion.
        if (localStorage.getItem('sweet_cart')) {
            localStorage.removeItem('sweet_cart');
        }

        const savedCart = sessionStorage.getItem('sweet_cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save to SessionStorage whenever items change
    useEffect(() => {
        sessionStorage.setItem('sweet_cart', JSON.stringify(items));
    }, [items]);

    const addToCart = React.useCallback((product: Product, quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity }];
        });

        // Trigger toast (Optimistic UI)
        toast.success(`${product.name} adicionado!`);
    }, []);

    const removeFromCart = React.useCallback((productId: number) => {
        setItems(prev => prev.filter(item => item.product.id !== productId));
    }, []);

    const updateQuantity = React.useCallback((productId: number, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    }, []);

    const clearCart = React.useCallback(() => {
        setItems([]);
    }, []);

    const cartTotal = React.useMemo(() => items.reduce((total, item) => {
        return total + (parseFloat(item.product.price) * item.quantity);
    }, 0), [items]);

    const cartCount = React.useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);

    const value = React.useMemo(() => ({
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount
    }), [items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount]);

    return (
        <CartContext.Provider value={value}>
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
