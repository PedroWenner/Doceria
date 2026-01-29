'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useAuth();
    const { cartCount } = useCart();
    const [apiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

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
                        <Link href="/login" className="text-xs font-bold text-brand-pink bg-brand-pink/10 px-3 py-1.5 rounded-full">Entrar</Link>
                    ) : (
                        <Link href="/profile" className="w-8 h-8 bg-brand-pink/20 rounded-full flex items-center justify-center text-brand-choco font-bold text-xs border border-brand-pink/30 shadow-sm">
                            {user.name.charAt(0)}
                        </Link>
                    )}
                </div>
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
                        <Link href="/login" className="flex items-center gap-2 text-gray-400 hover:text-brand-pink transition-colors font-bold text-sm">
                            <span>Entrar</span>
                            <span className="text-xl">👤</span>
                        </Link>
                    ) : (
                        <Link href="/profile" className="flex items-center gap-2 cursor-pointer group">
                            <div className="w-9 h-9 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-choco font-bold text-sm border-2 border-transparent group-hover:border-brand-pink/30 transition-all">
                                {user.name.charAt(0)}
                            </div>
                        </Link>
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
                        {/* Badge could go here */}
                    </span>
                    <span className={`text-[10px] font-bold mt-1 ${pathname === '/cart' ? 'opacity-100' : 'opacity-0'}`}>Cesta</span>
                </Link>
                <Link href={user ? "/profile" : "/login"} className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${pathname === '/profile' ? 'text-brand-pink -translate-y-1' : 'text-gray-400'}`}>
                    <span className="text-2xl drop-shadow-sm">{pathname === '/profile' ? '👤' : '👽'}</span>
                    <span className={`text-[10px] font-bold mt-1 ${pathname === '/profile' ? 'opacity-100' : 'opacity-0'}`}>Perfil</span>
                </Link>
            </nav>
        </div>
    );
}
