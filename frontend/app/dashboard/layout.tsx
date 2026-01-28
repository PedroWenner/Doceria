'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import ThemeToggle from '@/app/components/ThemeToggle';
import LanguageToggle from '@/app/components/LanguageToggle';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { t } = useLanguage();
    const { user, logout, isLoading } = useAuth();

    React.useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [isLoading, user, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-brand-cream/20 flex items-center justify-center">
                <LoadingSpinner />
                <p className="ml-3 text-brand-choco font-bold">Carregando...</p>
            </div>
        );
    }

    // Permissions Logic
    const allMenuItems = [
        { icon: '📊', label: 'sidebar.dashboard', href: '/dashboard', roles: ['admin', 'manager'] },
        { icon: '🛍️', label: 'orders.title', href: '/dashboard/orders', roles: ['admin', 'manager'] },
        { icon: '👥', label: 'sidebar.users', href: '/dashboard/users', roles: ['admin', 'manager'] },
        { icon: '🧁', label: 'sidebar.products', href: '/dashboard/products', roles: ['admin', 'manager'] },
        { icon: '📋', label: 'sidebar.audit', href: '/dashboard/audit', roles: ['admin'] },
        { icon: '⚙️', label: 'settings.title', href: '/dashboard/settings', roles: ['admin'] },
    ];

    const menuItems = allMenuItems.filter(item =>
        user && item.roles.includes(user.role)
    );

    return (
        <div className="min-h-screen bg-brand-cream/20 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden h-16 bg-white/40 backdrop-blur-md border-b border-white/50 flex items-center justify-between px-4 fixed top-0 w-full z-30">
                <span className="text-xl font-bold text-brand-choco">SweetStore</span>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-lg text-brand-choco hover:bg-brand-gold/20 cursor-pointer transition-colors"
                >
                    <span className="text-2xl">☰</span>
                </button>
            </header>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-white/40 backdrop-blur-xl border-r border-white/50 h-screen fixed top-0 left-0 p-6 flex flex-col z-40
                transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-brand-choco">SweetStore</h1>
                            <p className="text-xs text-brand-choco/60 font-medium tracking-widest uppercase mt-1">Dashboard</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <ThemeToggle />
                        <LanguageToggle />
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                                    block px-4 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-3
                                    ${isActive
                                        ? 'bg-brand-pink/20 text-brand-choco font-bold border border-brand-pink/30 shadow-sm'
                                        : 'text-brand-choco/80 font-medium hover:bg-white/40 hover:scale-[1.02] hover:text-brand-choco'}
                                `}
                            >
                                <span>{item.icon}</span>
                                <span>{t(item.label) || item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-6 border-t border-brand-choco/10">
                    <button
                        onClick={logout}
                        className="w-full text-left flex items-center mb-4 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors cursor-pointer group"
                    >
                        <span className="mr-2 group-hover:scale-110 transition-transform">🚪</span>
                        <span className="font-medium">{t('sidebar.logout')}</span>
                    </button>

                    <div className="flex items-center space-x-3 cursor-default">
                        <div className="w-10 h-10 rounded-full bg-brand-gold/30 flex items-center justify-center text-brand-choco font-bold uppercase">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-brand-choco truncate w-32">{user?.name || 'User'}</p>
                            <p className="text-xs text-brand-choco/60 capitalize">{user?.role || 'Guest'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64 flex-1 p-8 pt-20 md:pt-8 transition-all duration-300">
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#fff',
                            color: '#4a2c2a', // brand-choco
                            border: '1px solid #eeb7ce', // brand-pink
                            padding: '16px',
                            borderRadius: '12px',
                        },
                        success: {
                            iconTheme: {
                                primary: '#eeb7ce',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                {children}
            </main>
        </div>
    );
}
