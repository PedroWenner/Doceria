'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
// import { useAuth } from '@/app/context/AuthContext'; // Removed
import { useCart } from '@/app/context/CartContext';
import { useTheme } from '@/app/context/ThemeContext';

import { StoreAuthProvider, useStoreAuth } from '@/app/context/StoreAuthContext';

function StoreLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useStoreAuth();
    const { cartCount } = useCart();
    const { storeTheme, toggleStoreTheme } = useTheme();
    const [apiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false); // State

    useEffect(() => {
        // Fetch public settings for Logo
        fetch(`${apiUrl}/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.data?.logo_url) setLogoUrl(data.data.logo_url);
            })
            .catch(err => console.error("Logo fetch error", err));
    }, [apiUrl]);

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
            {/* Backdrop for Menu */}
            {showProfileMenu && (
                <div
                    className="fixed inset-0 z-20 bg-transparent"
                    onClick={() => setShowProfileMenu(false)}
                />
            )}

            {/* Mobile Header - App Like */}
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-sm px-4 py-3 flex items-center justify-between md:hidden transition-all duration-300 border-b border-gray-100">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Entregar em</span>
                    <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 rounded-md -ml-1 px-1 transition-colors">
                        <span className="font-bold text-gray-900 text-sm truncate max-w-[200px]">Rua das Gostosuras, 123 ▾</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!user ? (
                        <Link href="/signin" className="text-xs font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">Entrar</Link>
                    ) : (
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 font-bold text-xs border border-gray-200 relative z-50"
                        >
                            {user.name.charAt(0)}
                        </button>
                    )}
                </div>

                {/* Mobile Profile Dropdown (Absolute to header) */}
                {showProfileMenu && user && (
                    <div className="absolute top-full right-4 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-slideDown z-50 md:hidden">
                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                            <p className="text-xs text-gray-400">Olá, {user.name.split(' ')[0]}</p>
                        </div>
                        <button
                            onClick={() => { setShowProfileMenu(false); logout(); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2"
                        >
                            <span>🚪</span> Sair
                        </button>
                    </div>
                )}
            </header>

            {/* Desktop Navbar (Simple) */}
            <header className="hidden md:flex bg-white/90 backdrop-blur-sm shadow-sm px-8 py-4 items-center justify-between sticky top-0 z-30 border-b border-gray-100">
                <div className="flex items-center gap-12">
                    {logoUrl ? (
                        <img src={`${apiUrl.replace('/api', '')}/storage/${logoUrl}`} alt="Logo" className="h-10 w-auto object-contain" />
                    ) : (
                        <span className="font-bold text-2xl text-gray-900 font-serif italic tracking-tight">SweetStore</span>
                    )}
                    <nav className="flex gap-8">
                        {/* Desktop Links */}
                        <Link href="/" className={`font-bold text-sm tracking-wide ${pathname === '/' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>INÍCIO</Link>
                        <Link href="/menu" className={`font-bold text-sm tracking-wide ${pathname === '/menu' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>CARDÁPIO</Link>
                        <Link href="/orders" className={`font-bold text-sm tracking-wide ${pathname === '/orders' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>PEDIDOS</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    {/* Theme Switcher (Desktop) */}
                    <button
                        onClick={toggleStoreTheme}
                        className="hidden md:flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all hover:scale-105"
                        style={{
                            backgroundColor: 'var(--store-card)',
                            color: 'var(--store-text)',
                            borderColor: 'var(--store-border)'
                        }}
                        title={storeTheme === 'minimalist' ? 'Mudar para Colorido' : 'Mudar para Minimalista'}
                    >
                        <span>{storeTheme === 'minimalist' ? '🎨' : '🖤'}</span>
                    </button>

                    {/* Cart Icon */}
                    <Link href="/cart" className="relative group hover:scale-105 transition-transform">
                        <span className="text-2xl opacity-80 group-hover:opacity-100 transition-opacity">🛍️</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm border-2 border-white"
                                style={{ backgroundColor: 'var(--store-primary)', color: 'var(--store-primary-fg)' }}>
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* User Profile / Login */}
                    {!user ? (
                        <Link href="/signin" className="flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-lg transition-colors hover:opacity-90"
                            style={{ backgroundColor: 'var(--store-secondary)', color: 'var(--store-text)' }}>
                            <span>Entrar</span>
                        </Link>
                    ) : (
                        <div className="relative z-50">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border group-hover:opacity-80 transition-all"
                                    style={{
                                        backgroundColor: 'var(--store-secondary)',
                                        color: 'var(--store-text)',
                                        borderColor: 'var(--store-border)'
                                    }}>
                                    {user.name.charAt(0)}
                                </div>
                            </button>

                            {/* Desktop Menu */}
                            {showProfileMenu && (
                                <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border overflow-hidden py-2 animate-fadeIn ring-1"
                                    style={{ borderColor: 'var(--store-border)', ringColor: 'var(--store-ring)' }}>
                                    <div className="px-4 py-3 border-b mb-1" style={{ borderColor: 'var(--store-border)' }}>
                                        <p className="text-xs mb-0.5" style={{ color: 'var(--store-text-muted)' }}>Logado como</p>
                                        <p className="font-bold truncate text-sm" style={{ color: 'var(--store-text)' }}>{user.name}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            logout();
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 hover:bg-gray-50"
                                        style={{ color: 'var(--store-text-muted)' }}
                                    >
                                        <span>🚪</span> Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 md:p-8 animate-fadeIn">
                <Toaster
                    position="bottom-center"
                    toastOptions={{
                        style: {
                            background: '#111827', // Gray-900
                            color: '#FFF',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: 500,
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }
                    }}
                />
                {children}
            </main>

            {/* Mobile Bottom Navigation - Floating */}
            <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border shadow-xl rounded-2xl flex justify-around py-3 z-40 md:hidden"
                style={{ borderColor: 'var(--store-border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                <Link href="/" className={`flex flex-col items-center justify-center w-16 transition-all duration-300 group`}>
                    <span className={`text-2xl drop-shadow-sm transition-transform group-active:scale-90 ${pathname === '/' ? 'grayscale-0 opacity-100' : 'grayscale opacity-50'}`}>🏠</span>
                    <span className={`text-[10px] font-bold mt-1 transition-opacity ${pathname === '/' ? 'opacity-100' : 'opacity-0 h-0'}`} style={{ color: 'var(--store-text)' }}>Início</span>
                </Link>
                <Link href="/menu" className={`flex flex-col items-center justify-center w-16 transition-all duration-300 group`}>
                    <span className={`text-2xl drop-shadow-sm transition-transform group-active:scale-scale-90 ${pathname === '/menu' ? 'grayscale-0 opacity-100' : 'grayscale opacity-50'}`}>🍔</span>
                    <span className={`text-[10px] font-bold mt-1 transition-opacity ${pathname === '/menu' ? 'opacity-100' : 'opacity-0 h-0'}`} style={{ color: 'var(--store-text)' }}>Menu</span>
                </Link>

                {/* Mobile Theme Toggle (Center) */}
                <button
                    onClick={toggleStoreTheme}
                    className="flex flex-col items-center justify-center w-16 transition-all duration-300 group active:scale-90"
                >
                    <span className={`text-2xl drop-shadow-sm transition-transform ${storeTheme === 'minimalist' ? 'grayscale opacity-80' : 'grayscale-0 opacity-100'}`}>
                        {storeTheme === 'minimalist' ? '🎨' : '🖤'}
                    </span>
                    <span className="text-[10px] font-bold mt-1" style={{ color: 'var(--store-text)' }}>Tema</span>
                </button>

                <Link href="/cart" className={`flex flex-col items-center justify-center w-16 transition-all duration-300 group`}>
                    <div className="relative">
                        <span className={`text-2xl drop-shadow-sm transition-transform group-active:scale-90 ${pathname === '/cart' ? 'grayscale-0 opacity-100' : 'grayscale opacity-50'}`}>🛍️</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white"
                                style={{ backgroundColor: 'var(--store-primary)' }}>
                                {cartCount}
                            </span>
                        )}
                    </div>
                    <span className={`text-[10px] font-bold mt-1 transition-opacity ${pathname === '/cart' ? 'opacity-100' : 'opacity-0 h-0'}`} style={{ color: 'var(--store-text)' }}>Cesta</span>
                </Link>

                {!user ? (
                    <Link href="/signin" className={`flex flex-col items-center justify-center w-16 transition-all duration-300 group`}>
                        <span className={`text-2xl drop-shadow-sm transition-transform group-active:scale-90 ${pathname === '/signin' ? 'grayscale-0 opacity-100' : 'grayscale opacity-50'}`}>👤</span>
                        <span className={`text-[10px] font-bold mt-1 transition-opacity ${pathname === '/signin' ? 'opacity-100' : 'opacity-0 h-0'}`} style={{ color: 'var(--store-text)' }}>Entrar</span>
                    </Link>
                ) : (
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className={`flex flex-col items-center justify-center w-16 transition-all duration-300 group`}
                    >
                        <span className={`text-2xl drop-shadow-sm transition-transform group-active:scale-90 ${showProfileMenu ? 'grayscale-0 opacity-100' : 'grayscale opacity-50'}`}>👤</span>
                        <span className={`text-[10px] font-bold mt-1 transition-opacity ${showProfileMenu ? 'opacity-100' : 'opacity-0 h-0'}`} style={{ color: 'var(--store-text)' }}>Perfil</span>
                    </button>
                )}
            </nav>

            {/* Mobile Bottom Menu (Absolute to Bottom Nav) */}
            {showProfileMenu && user && (
                <div className="fixed bottom-28 right-6 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden py-2 animate-slideUp z-50 md:hidden">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs text-gray-400">Olá, {user.name.split(' ')[0]}</p>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors flex items-center gap-2"
                    >
                        <span>🚪</span> Sair
                    </button>
                </div>
            )}
        </div>
    );
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    return (
        <StoreAuthProvider>
            <StoreLayoutContent>{children}</StoreLayoutContent>
        </StoreAuthProvider>
    );
}
