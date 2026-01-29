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
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-50">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-2 block">📝</span>
                    <h1 className="text-2xl font-bold text-brand-choco">Criar Conta</h1>
                    <p className="text-gray-400 text-sm mt-2">Para acompanhar seus pedidos</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                        <input
                            type="text"
                            className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-pink/20 transition-all font-medium"
                            placeholder="Seu nome"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
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
                            placeholder="No mínimo 6 caracteres"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Confirmar Senha</label>
                        <input
                            type="password"
                            className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-pink/20 transition-all font-medium"
                            placeholder="Repita a senha"
                            value={passwordConfirmation}
                            onChange={e => setPasswordConfirmation(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-pink text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-pink/30 hover:bg-brand-pink/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Criando...' : 'Cadastrar'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Já tem conta?{' '}
                    <Link href={`/signin${redirectUrl ? `?redirect=${redirectUrl}` : ''}`} className="text-brand-pink font-bold hover:underline">
                        Fazer login
                    </Link>
                </div>
            </div>
        </div>
    );
}
