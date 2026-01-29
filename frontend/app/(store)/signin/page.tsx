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
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-50">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-2 block">🍩</span>
                    <h1 className="text-2xl font-bold text-brand-choco">Entrar na SweetStore</h1>
                    <p className="text-gray-400 text-sm mt-2">Que bom te ver de novo!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-pink/20 transition-all font-medium"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
                        <input
                            type="password"
                            className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-pink/20 transition-all font-medium"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-pink text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-pink/30 hover:bg-brand-pink/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Entrando...' : 'Acessar Conta'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Ainda não tem conta?{' '}
                    <Link href={`/signup${redirectUrl ? `?redirect=${redirectUrl}` : ''}`} className="text-brand-pink font-bold hover:underline">
                        Criar cadastro
                    </Link>
                </div>
            </div>
        </div>
    );
}
