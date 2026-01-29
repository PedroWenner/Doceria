'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type StoreTheme = 'minimalist' | 'colorful';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    storeTheme: StoreTheme;
    toggleStoreTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');
    const [storeTheme, setStoreTheme] = useState<StoreTheme>('minimalist'); // Default

    useEffect(() => {
        // Load saved Dashboard theme
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }

        // Load saved Storefront theme
        const savedStoreTheme = localStorage.getItem('store_theme') as StoreTheme | null;
        if (savedStoreTheme) {
            setStoreTheme(savedStoreTheme);
            document.documentElement.setAttribute('data-store-theme', savedStoreTheme);
        } else {
            // Default is minimalist (already set in :root but explicit is good)
            document.documentElement.setAttribute('data-store-theme', 'minimalist');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleStoreTheme = () => {
        const newStoreTheme = storeTheme === 'minimalist' ? 'colorful' : 'minimalist';
        setStoreTheme(newStoreTheme);
        localStorage.setItem('store_theme', newStoreTheme);
        document.documentElement.setAttribute('data-store-theme', newStoreTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, storeTheme, toggleStoreTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
