'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useAuth();
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
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            {/* Mobile Header */}
            <header className="sticky top-0 z-30 bg-white shadow-sm px-4 py-3 flex items-center justify-between md:hidden">
                <div className="flex items-center gap-2">
                    {logoUrl ? (
                        <img src={`${apiUrl.replace('/api', '')}/storage/${logoUrl}`} alt="Logo" className="h-8 w-auto object-contain rounded-md" />
                    ) : (
                        <span className="font-bold text-lg text-brand-choco font-serif italic">SweetStore</span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {!user ? (
                        <Link href="/login" className="text-sm font-bold text-brand-pink">Entrar</Link>
                    ) : (
                        <div className="w-8 h-8 bg-brand-pink/20 rounded-full flex items-center justify-center text-brand-choco font-bold text-xs border border-brand-pink">
                            {user.name.charAt(0)}
                        </div>
                    )}
                </div>
            </header>

            {/* Desktop Navbar (Simple) */}
            <header className="hidden md:flex bg-white shadow-sm px-8 py-4 items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-8">
                    {logoUrl ? (
                        <img src={`${apiUrl.replace('/api', '')}/storage/${logoUrl}`} alt="Logo" className="h-10 w-auto object-contain rounded-lg" />
                    ) : (
                        <span className="font-bold text-2xl text-brand-choco font-serif italic">SweetStore</span>
                    )}
                    <nav className="flex gap-6">
                        <Link href="/" className={`font-medium ${pathname === '/' ? 'text-brand-pink' : 'text-gray-600'}`}>Início</Link>
                        <Link href="/menu" className={`font-medium ${pathname === '/menu' ? 'text-brand-pink' : 'text-gray-600'}`}>Cardápio</Link>
                        <Link href="/orders/my" className={`font-medium ${pathname === '/orders/my' ? 'text-brand-pink' : 'text-gray-600'}`}>Meus Pedidos</Link>
                    </nav>
                </div>
                <div>
                    {!user ? (
                        <Link href="/login" className="px-4 py-2 bg-brand-pink text-white rounded-full font-bold hover:bg-brand-pink/90 transition-colors">Entrar</Link>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Olá, {user.name}</span>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 md:p-8">
                <Toaster position="bottom-center" />
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 pb-safe z-40 md:hidden">
                <Link href="/" className={`flex flex-col items-center gap-1 ${pathname === '/' ? 'text-brand-pink' : 'text-gray-400'}`}>
                    <span className="text-2xl">🏠</span>
                    <span className="text-[10px] font-bold">Início</span>
                </Link>
                <Link href="/menu" className={`flex flex-col items-center gap-1 ${pathname === '/menu' ? 'text-brand-pink' : 'text-gray-400'}`}>
                    <span className="text-2xl">🍔</span>
                    <span className="text-[10px] font-bold">Cardápio</span>
                </Link>
                <Link href="/cart" className={`flex flex-col items-center gap-1 ${pathname === '/cart' ? 'text-brand-pink' : 'text-gray-400'}`}>
                    <span className="text-2xl relative">
                        🛒
                        {/* Badge example */}
                        {/* <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">2</span> */}
                    </span>
                    <span className="text-[10px] font-bold">Carrinho</span>
                </Link>
                <Link href={user ? "/profile" : "/login"} className={`flex flex-col items-center gap-1 ${pathname === '/profile' ? 'text-brand-pink' : 'text-gray-400'}`}>
                    <span className="text-2xl">👤</span>
                    <span className="text-[10px] font-bold">Perfil</span>
                </Link>
            </nav>
        </div>
    );
}
