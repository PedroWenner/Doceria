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

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (token: string, user: User, redirectPath?: string) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    const checkAuth = async () => {
        const token = Cookies.get('auth_token');

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
                } else {
                    console.error('Auth Check: Response OK but NO DATA found.', response);
                }
            } else {
                console.warn('Auth Check: Response NOT OK. Logging out.');
                logout();
            }
        } catch (error) {
            console.error('Auth Check: Network/Parse Error', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = (token: string, userData: User, redirectPath?: string) => {
        Cookies.set('auth_token', token, { expires: 7 }); // 7 days
        setUser(userData);

        if (redirectPath) {
            router.push(redirectPath);
        } else if (userData.role === 'customer') {
            router.push('/');
        } else {
            router.push('/dashboard');
        }
    };

    const logout = () => {
        Cookies.remove('auth_token');
        setUser(null);
        router.push('/login');
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
