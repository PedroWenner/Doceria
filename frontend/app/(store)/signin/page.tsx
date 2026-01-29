'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function SigninPage() {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                const { user, access_token } = data.data; // Access nested data
                toast.success(`Bem-vindo, ${user.name}! 🍩`);
                // If we have a redirect param (e.g. from checkout), use it
                // If not, AuthContext defaults to '/' for customers
                login(access_token, user, redirectUrl || undefined);
            } else {
                toast.error(data.message || 'Email ou senha incorretos.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro de conexão.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50/50">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 hover:rotate-6 transition-transform">
                        <span className="text-3xl">🍩</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bem-vindo de volta!</h1>
                    <p className="text-gray-500 text-sm mt-2">Acesse sua conta para continuar.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide ml-1">Email</label>
                        <input
                            type="email"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-medium placeholder:text-gray-400"
                            placeholder="exemplo@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide ml-1">Senha</label>
                        <input
                            type="password"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-medium placeholder:text-gray-400"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold text-base transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-gray-900/10"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                    <p className="text-sm text-gray-500">
                        Não possui uma conta?{' '}
                        <Link href={`/signup${redirectUrl ? `?redirect=${redirectUrl}` : ''}`} className="text-pink-600 font-bold hover:text-pink-700 hover:underline transition-colors">
                            Cadastre-se
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
