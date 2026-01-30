'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import ThemeToggle from '@/app/components/ThemeToggle';
import LanguageToggle from '@/app/components/LanguageToggle';
import SessionTimer from '@/app/components/SessionTimer';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    FileText,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    Store
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    user: any;
    logout: () => void;
    logoUrl: string | null;
    systemName: string;
    apiUrl: string;
}

export default function Sidebar({
    isOpen,
    setIsOpen,
    user,
    logout,
    logoUrl,
    systemName,
    apiUrl
}: SidebarProps) {
    const pathname = usePathname();
    const { t } = useLanguage();

    const allMenuItems = [
        {
            icon: LayoutDashboard,
            label: 'sidebar.dashboard',
            href: '/dashboard',
            roles: ['admin', 'manager']
        },
        {
            icon: ShoppingBag,
            label: 'orders.title',
            href: '/dashboard/orders',
            roles: ['admin', 'manager']
        },
        {
            icon: Users,
            label: 'sidebar.users',
            href: '/dashboard/users',
            roles: ['admin']
        },
        {
            icon: Package,
            label: 'sidebar.products',
            href: '/dashboard/products',
            roles: ['admin', 'manager']
        },
        {
            icon: ShieldCheck,
            label: 'sidebar.audit',
            href: '/dashboard/audit',
            roles: ['admin']
        },
        {
            icon: CreditCard,
            label: 'Meios de Pagamento',
            href: '/dashboard/settings/payments',
            roles: ['admin']
        },
        {
            icon: Settings,
            label: 'settings.title',
            href: '/dashboard/settings',
            roles: ['admin']
        },
    ];

    const menuItems = allMenuItems.filter(item =>
        user && item.roles.includes(user.role)
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 z-50 h-screen w-72 
                bg-white dark:bg-slate-900 
                border-r border-slate-200 dark:border-slate-800
                flex flex-col
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                {/* Header / Logo */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center">
                    <div className="relative w-full flex justify-center mb-4">
                        {logoUrl ? (
                            <img
                                src={`${apiUrl.replace('/api', '')}/storage/${logoUrl}`}
                                alt="Logo"
                                className="h-16 w-auto object-contain"
                            />
                        ) : (
                            <div className="flex flex-col items-center">
                                <Store className="w-10 h-10 text-slate-900 dark:text-slate-100 mb-2" />
                                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                    SweetStore
                                </span>
                            </div>
                        )}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-0 right-0 md:hidden text-slate-400 hover:text-slate-600"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center uppercase tracking-wider">
                        {systemName}
                    </p>

                    <div className="flex gap-2 mt-4">
                        <ThemeToggle />
                        <LanguageToggle />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                                    ${isActive
                                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                    }
                                `}
                            >
                                <Icon size={18} className={`
                                    ${isActive ? 'text-white dark:text-slate-900' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}
                                `} />
                                <span className="flex-1">{t(item.label) || item.label}</span>
                                {isActive && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <SessionTimer />

                    <div className="flex items-center gap-3 mt-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold uppercase ring-2 ring-white dark:ring-slate-900 shadow-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 capitalize truncate">
                                {user?.role || 'Guest'}
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title={t('sidebar.logout')}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
