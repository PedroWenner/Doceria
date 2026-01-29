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

interface AdminAuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (token: string, user: User, redirectPath?: string) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    const checkAuth = async () => {
        const token = Cookies.get('admin_token');

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
                    // Start: Security Check - Only Admins/Managers Allowed
                    if (response.data.role === 'customer') {
                        console.warn('Admin Auth: Customer role detected in Admin Context. Logging out.');
                        logout(); // Kick out
                        return;
                    }
                    // End: Security Check
                    setUser(response.data);
                }
            } else {
                logout();
            }
        } catch (error) {
            console.error('Admin Auth Check Error', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = (token: string, userData: User, redirectPath?: string) => {
        Cookies.set('admin_token', token, { expires: 7, path: '/' });
        setUser(userData);
        router.push(redirectPath || '/dashboard');
    };

    const logout = () => {
        Cookies.remove('admin_token', { path: '/' });
        setUser(null);
        window.location.href = '/login';
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AdminAuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};
