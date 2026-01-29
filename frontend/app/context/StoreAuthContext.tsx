'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'customer';
}

interface StoreAuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (token: string, user: User, redirectPath?: string) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const StoreAuthContext = createContext<StoreAuthContextType | undefined>(undefined);

export function StoreAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    const checkAuth = async () => {
        const token = Cookies.get('store_token');

        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/auth/me`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const response = await res.json();
                if (response.data) {
                    setUser(response.data);
                }
            } else {
                logout();
            }
        } catch (error) {
            console.error('Store Auth Check Error', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = (token: string, userData: User, redirectPath?: string) => {
        Cookies.set('store_token', token, { expires: 7, path: '/' });
        setUser(userData);
        router.push(redirectPath || '/');
    };

    const logout = () => {
        Cookies.remove('store_token', { path: '/' });
        setUser(null);
        window.location.href = '/signin';
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <StoreAuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
            {children}
        </StoreAuthContext.Provider>
    );
}

export const useStoreAuth = () => {
    const context = useContext(StoreAuthContext);
    if (context === undefined) {
        throw new Error('useStoreAuth must be used within a StoreAuthProvider');
    }
    return context;
};
