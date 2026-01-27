'use client';

import React from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const token = Cookies.get('auth_token');

            if (token) {
                await fetch(`${apiUrl}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            Cookies.remove('auth_token');
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen bg-brand-cream/20 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white/40 backdrop-blur-xl border-r border-white/50 h-screen fixed top-0 left-0 p-6 flex flex-col z-20">
                <div className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-choco">SweetStore</h1>
                        <p className="text-xs text-brand-choco/60 font-medium tracking-widest uppercase mt-1">Dashboard</p>
                    </div>
                    <ThemeToggle />
                </div>

                <nav className="flex-1 space-y-2">
                    <Link href="/dashboard" className="block px-4 py-3 rounded-xl bg-brand-pink/20 text-brand-choco font-bold border border-brand-pink/30">
                        📊 Overview
                    </Link>
                    <Link href="/dashboard/orders" className="block px-4 py-3 rounded-xl hover:bg-white/40 text-brand-choco/80 font-medium transition-all">
                        🛍️ Orders
                    </Link>
                    <Link href="/dashboard/products" className="block px-4 py-3 rounded-xl hover:bg-white/40 text-brand-choco/80 font-medium transition-all">
                        🍰 Products
                    </Link>
                    <Link href="/dashboard/users" className="block px-4 py-3 rounded-xl hover:bg-white/40 text-brand-choco/80 font-medium transition-all">
                        👥 Users
                    </Link>
                </nav>

                <div className="mt-auto pt-6 border-t border-brand-choco/10">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center mb-4 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    >
                        <span className="mr-2">🚪</span>
                        <span className="font-medium">Sign Out</span>
                    </button>

                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-brand-gold/30 flex items-center justify-center text-brand-choco font-bold">
                            U
                        </div>
                        <div>
                            <p className="text-sm font-bold text-brand-choco">User Name</p>
                            <p className="text-xs text-brand-choco/60">Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
