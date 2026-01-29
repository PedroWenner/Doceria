'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function SignupPage() {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== passwordConfirmation) {
            toast.error("As senhas não conferem.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                    role: 'customer' // Enforce customer role
                })
            });
            const data = await res.json();

            if (res.ok) {
                const { user, access_token } = data.data; // Access nested data
                toast.success(`Cadastro realizado! Bem-vindo, ${user.name}! 🍰`);
                login(access_token, user, redirectUrl || undefined);
            } else {
                toast.error(data.message || 'Erro ao cadastrar.');
                if (data.errors) {
                    Object.values(data.errors).forEach((err: any) => toast.error(err[0]));
                }
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
                        <span className="text-3xl">📝</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Crie sua Conta</h1>
                    <p className="text-gray-500 text-sm mt-2">Junte-se a nós para saborear o melhor.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide ml-1">Nome Completo</label>
                        <input
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-medium placeholder:text-gray-400"
                            placeholder="Seu nome"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide ml-1">Email</label>
                        <input
                            type="email"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-medium placeholder:text-gray-400"
                            placeholder="seu@email.com"
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
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide ml-1">Confirmar Senha</label>
                        <input
                            type="password"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-medium placeholder:text-gray-400"
                            placeholder="Repita a senha"
                            value={passwordConfirmation}
                            onChange={e => setPasswordConfirmation(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold text-base transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-gray-900/10"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Criar Conta'
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                    <p className="text-sm text-gray-500">
                        Já tem conta?{' '}
                        <Link href={`/signin${redirectUrl ? `?redirect=${redirectUrl}` : ''}`} className="text-pink-600 font-bold hover:text-pink-700 hover:underline transition-colors">
                            Fazer login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
