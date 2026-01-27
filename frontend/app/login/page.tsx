'use client';

import { useState } from 'react';
import GlassCard from '@/app/components/GlassCard';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) throw new Error('Falha no login');

            const data = await res.json();
            Cookies.set('auth_token', data.access_token, { expires: 1 }); // 1 day
            router.push('/dashboard');
        } catch (err) {
            setError('Credenciais inválidas ou erro no servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-pink via-brand-cream to-brand-gold/20 p-4">
            {/* Background Decorative Elements */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-brand-gold/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-brand-pink/40 rounded-full blur-3xl"></div>

            <GlassCard className="w-full max-w-md relative z-10 border-white/60">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-brand-choco mb-2">SweetStore</h1>
                    <p className="text-brand-choco/70 font-medium">Indulge in Excellence</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-brand-choco mb-1 ml-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/50 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-brand-choco placeholder-brand-choco/30 transition-all font-medium"
                            placeholder="patissier@sweetstore.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-choco mb-1 ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/50 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-brand-choco placeholder-brand-choco/30 transition-all font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-brand-choco border-brand-gold/50 rounded focus:ring-brand-gold/50" />
                            <label className="ml-2 block text-sm text-brand-choco/80 font-medium">Remember me</label>
                        </div>
                        <a href="#" className="text-sm font-bold text-brand-choco hover:text-brand-gold transition-colors">Forgot password?</a>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-brand-cream bg-brand-choco hover:bg-brand-choco/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-choco transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Sign In
                    </button>
                </form>
            </GlassCard>
        </div>
    );
}
