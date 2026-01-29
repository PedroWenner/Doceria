'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth(); // Destructure logout
    const { cartCount } = useCart();
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
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm px-4 py-3 flex items-center justify-between md:hidden transition-all duration-300">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Entregar em</span>
                    <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 rounded-md -ml-1 px-1 transition-colors">
                        <span className="font-bold text-brand-choco text-sm truncate max-w-[200px]">Rua das Gostosuras, 123 ▾</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!user ? (
                        <Link href="/signin" className="text-xs font-bold text-brand-pink bg-brand-pink/10 px-3 py-1.5 rounded-full">Entrar</Link>
                    ) : (
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="w-8 h-8 bg-brand-pink/20 rounded-full flex items-center justify-center text-brand-choco font-bold text-xs border border-brand-pink/30 shadow-sm relative z-50"
                        >
                            {user.name.charAt(0)}
                        </button>
                    )}
                </div>

                {/* Mobile Profile Dropdown (Absolute to header) */}
                {showProfileMenu && user && (
                    <div className="absolute top-full right-4 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-2 animate-slideDown z-50 md:hidden">
                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                            <p className="text-xs text-gray-400">Olá, {user.name.split(' ')[0]}</p>
                        </div>
                        <button
                            onClick={() => { setShowProfileMenu(false); logout(); }}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-bold transition-colors flex items-center gap-2"
                        >
                            <span>🚪</span> Sair
                        </button>
                    </div>
                )}
            </header>

            {/* Desktop Navbar (Simple) */}
            <header className="hidden md:flex bg-white/90 backdrop-blur-sm shadow-sm px-8 py-4 items-center justify-between sticky top-0 z-30 ring-1 ring-gray-100">
                <div className="flex items-center gap-12">
                    {logoUrl ? (
                        <img src={`${apiUrl.replace('/api', '')}/storage/${logoUrl}`} alt="Logo" className="h-10 w-auto object-contain rounded-lg hover:scale-105 transition-transform" />
                    ) : (
                        <span className="font-bold text-2xl text-brand-choco font-serif italic tracking-tight">SweetStore</span>
                    )}
                    <nav className="flex gap-8">
                        {/* Desktop Links */}
                        <Link href="/" className={`font-bold text-sm tracking-wide ${pathname === '/' ? 'text-brand-pink' : 'text-gray-500 hover:text-brand-choco'} transition-colors`}>INÍCIO</Link>
                        <Link href="/menu" className={`font-bold text-sm tracking-wide ${pathname === '/menu' ? 'text-brand-pink' : 'text-gray-500 hover:text-brand-choco'} transition-colors`}>CARDÁPIO</Link>
                        <Link href="/orders/my" className={`font-bold text-sm tracking-wide ${pathname === '/orders/my' ? 'text-brand-pink' : 'text-gray-500 hover:text-brand-choco'} transition-colors`}>PEDIDOS</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    {/* Cart Icon */}
                    <Link href="/cart" className="relative group hover:scale-110 transition-transform">
                        <span className="text-2xl drop-shadow-sm">🛍️</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md animate-bounce-slow border-2 border-white">
                                {cartCount}
                            </span>
                        )}
                        {/* Tooltip Hint */}
                        <div className="absolute top-full right-0 mt-2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                            {cartCount} gostosuras
                        </div>
                    </Link>

                    {/* User Profile / Login */}
                    {!user ? (
                        <Link href="/signin" className="flex items-center gap-2 text-gray-400 hover:text-brand-pink transition-colors font-bold text-sm">
                            <span>Entrar</span>
                            <span className="text-xl">👤</span>
                        </Link>
                    ) : (
                        <div className="relative z-50">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <div className="w-9 h-9 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-choco font-bold text-sm border-2 border-transparent group-hover:border-brand-pink/30 transition-all">
                                    {user.name.charAt(0)}
                                </div>
                            </button>

                            {/* Desktop Menu */}
                            {showProfileMenu && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-fadeIn">
                                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                        <p className="text-xs text-gray-400">Logado como</p>
                                        <p className="font-bold text-brand-choco truncate text-sm">{user.name}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            console.log('Logout clicked desktop');
                                            logout();
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-bold transition-colors flex items-center gap-2"
                                    >
                                        <span>🚪</span> Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 md:p-8 animate-fadeIn">
                <Toaster
                    position="bottom-center"
                    toastOptions={{
                        style: {
                            background: '#2D1B18',
                            color: '#FFF',
                            borderRadius: '16px',
                            fontSize: '14px',
                            fontWeight: 600
                        }
                    }}
                />
                {children}
            </main>

            {/* Mobile Bottom Navigation - Floating */}
            <nav className="fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-brand-choco/10 rounded-2xl flex justify-around py-3 z-40 md:hidden ring-1 ring-gray-100">
                <Link href="/" className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${pathname === '/' ? 'text-brand-pink -translate-y-1' : 'text-gray-400'}`}>
                    <span className="text-2xl drop-shadow-sm">{pathname === '/' ? '🏠' : '🛖'}</span>
                    <span className={`text-[10px] font-bold mt-1 ${pathname === '/' ? 'opacity-100' : 'opacity-0'}`}>Início</span>
                </Link>
                <Link href="/menu" className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${pathname === '/menu' ? 'text-brand-pink -translate-y-1' : 'text-gray-400'}`}>
                    <span className="text-2xl drop-shadow-sm">{pathname === '/menu' ? '🍔' : '🥯'}</span>
                    <span className={`text-[10px] font-bold mt-1 ${pathname === '/menu' ? 'opacity-100' : 'opacity-0'}`}>Menu</span>
                </Link>
                <Link href="/cart" className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${pathname === '/cart' ? 'text-brand-pink -translate-y-1' : 'text-gray-400'}`}>
                    <span className="text-2xl drop-shadow-sm relative">
                        🛍️
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                {cartCount}
                            </span>
                        )}
                    </span>
                    <span className={`text-[10px] font-bold mt-1 ${pathname === '/cart' ? 'opacity-100' : 'opacity-0'}`}>Cesta</span>
                </Link>

                {/* Mobile Bottom Click uses toggle if user exists? Or just redirect? */}
                {/* For consistency with Header, let's keep this one as redirect to profile page if we had one. 
                    But user asked for dropdown. 
                    If I add click handler here it might conflict with Link.
                    I will Change Link to Div if user is logged in.
                */}
                {!user ? (
                    <Link href="/signin" className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${pathname === '/profile' ? 'text-brand-pink -translate-y-1' : 'text-gray-400'}`}>
                        <span className="text-2xl drop-shadow-sm">👽</span>
                        <span className={`text-[10px] font-bold mt-1 ${pathname === '/signin' ? 'opacity-100' : 'opacity-0'}`}>Entrar</span>
                    </Link>
                ) : (
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${showProfileMenu ? 'text-brand-pink -translate-y-1' : 'text-gray-400'}`}
                    >
                        <span className="text-2xl drop-shadow-sm">👤</span>
                        <span className={`text-[10px] font-bold mt-1 ${showProfileMenu ? 'opacity-100' : 'opacity-0'}`}>Perfil</span>
                    </button>
                )}
            </nav>

            {/* Mobile Bottom Menu (Absolute to Bottom Nav) */}
            {showProfileMenu && user && (
                <div className="fixed bottom-24 right-4 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-2 animate-slideUp z-50 md:hidden">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs text-gray-400">Olá, {user.name.split(' ')[0]}</p>
                    </div>
                    <button
                        onClick={() => {
                            console.log('Logout clicked mobile');
                            logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-bold transition-colors flex items-center gap-2"
                    >
                        <span>🚪</span> Sair
                    </button>
                </div>
            )}
        </div>
    );
}
