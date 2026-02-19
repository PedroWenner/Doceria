'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie'; // Added import for cookie usage
import { useRouter, usePathname } from 'next/navigation';
import LanguageToggle from '@/app/components/LanguageToggle';
import { useLanguage } from '@/app/context/LanguageContext';
// import { useAuth } from '@/app/context/AuthContext'; // Removed
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import SessionTimer from '@/app/components/SessionTimer';

import { AdminAuthProvider, useAdminAuth } from '@/app/context/AdminAuthContext';
import Sidebar from '@/app/components/Sidebar';

function DashboardInnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [systemName, setSystemName] = useState<string>('Dashboard');
    const [useFixedDriver, setUseFixedDriver] = useState(false);
    const { t } = useLanguage();
    const { user, logout, isLoading } = useAdminAuth(); // Use specific Admin Auth
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    // ... existing useEffects ...
    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                if (user) {
                    const token = Cookies.get('admin_token'); // Use admin_token
                    const res = await fetch(`${apiUrl}/settings`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.data.logo_url) setLogoUrl(data.data.logo_url);
                        if (data.data.system_name) setSystemName(data.data.system_name);
                        if (data.data.use_fixed_driver) setUseFixedDriver(data.data.use_fixed_driver);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch settings for layout", e);
            }
        };

        if (user) fetchSettings();
    }, [user, apiUrl]);

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
        { icon: '👥', label: 'sidebar.users', href: '/dashboard/users', roles: ['admin'] },
        { icon: '🧁', label: 'sidebar.products', href: '/dashboard/products', roles: ['admin', 'manager'] },
        { icon: '📋', label: 'sidebar.audit', href: '/dashboard/audit', roles: ['admin'] },
        { icon: '💳', label: 'sidebar.payments_methods', href: '/dashboard/settings/payments', roles: ['admin'] },
        { icon: '💵', label: 'sidebar.payments', href: '/dashboard/dashboard/payments', roles: ['admin', 'manager'] },
        { icon: '⚙️', label: 'settings.title', href: '/dashboard/settings', roles: ['admin'] },
    ];

    const menuItems = allMenuItems.filter(item =>
        user && item.roles.includes(user.role)
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 fixed top-0 w-full z-30">
                {logoUrl ? (
                    <img
                        src={`${apiUrl.replace('/api', '')}/storage/${logoUrl}`}
                        alt="Logo"
                        className="h-8 object-contain"
                    />
                ) : (
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">SweetStore</span>
                )}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="text-2xl">☰</span>
                </button>
            </header>

            {/* Sidebar Component */}
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                user={user}
                logout={logout}
                logoUrl={logoUrl}
                systemName={systemName}
                apiUrl={apiUrl}
                useFixedDriver={useFixedDriver}
            />

            {/* Main Content */}
            <main className="md:ml-72 flex-1 p-6 pt-20 md:p-8 md:pt-8 transition-all duration-300 min-h-screen">
                <Toaster
                    position="top-right"
                    toastOptions={{
                        className: 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-lg',
                        style: {
                            borderRadius: '8px',
                            background: '#fff',
                            color: '#0f172a',
                        },
                    }}
                />
                {children}
            </main>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminAuthProvider>
            <DashboardInnerLayout>{children}</DashboardInnerLayout>
        </AdminAuthProvider>
    );
}
