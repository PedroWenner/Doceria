'use client';

import { useState } from 'react';
import { useStoreAuth } from '@/app/context/StoreAuthContext'; // Updated import
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function SignupPage() {
    const { login } = useStoreAuth(); // Use store auth
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
        <div className="min-h-[80vh] flex items-center justify-center p-4 transition-colors duration-500"
            style={{ backgroundColor: 'var(--store-bg)' }}>
            <div className="p-10 rounded-2xl shadow-xl w-full max-w-sm border transition-all"
                style={{
                    backgroundColor: 'var(--store-card)',
                    borderColor: 'var(--store-border)'
                }}>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 hover:rotate-6 transition-transform group"
                        style={{ backgroundColor: 'var(--store-bg)' }}>
                        <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">📝</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--store-text)' }}>Crie sua Conta</h1>
                    <p className="text-sm mt-2" style={{ color: 'var(--store-text-muted)' }}>Junte-se a nós para saborear o melhor.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wide ml-1" style={{ color: 'var(--store-text)' }}>Nome Completo</label>
                        <input
                            type="text"
                            className="w-full border p-3.5 rounded-xl outline-none focus:ring-2 transition-all font-medium placeholder:text-gray-400"
                            style={{
                                backgroundColor: 'var(--store-bg)',
                                borderColor: 'var(--store-border)',
                                color: 'var(--store-text)',
                                '--tw-ring-color': 'var(--store-primary)'
                            } as React.CSSProperties}
                            placeholder="Seu nome"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wide ml-1" style={{ color: 'var(--store-text)' }}>Email</label>
                        <input
                            type="email"
                            className="w-full border p-3.5 rounded-xl outline-none focus:ring-2 transition-all font-medium placeholder:text-gray-400"
                            style={{
                                backgroundColor: 'var(--store-bg)',
                                borderColor: 'var(--store-border)',
                                color: 'var(--store-text)',
                                '--tw-ring-color': 'var(--store-primary)'
                            } as React.CSSProperties}
                            placeholder="seu@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wide ml-1" style={{ color: 'var(--store-text)' }}>Senha</label>
                        <input
                            type="password"
                            className="w-full border p-3.5 rounded-xl outline-none focus:ring-2 transition-all font-medium placeholder:text-gray-400"
                            style={{
                                backgroundColor: 'var(--store-bg)',
                                borderColor: 'var(--store-border)',
                                color: 'var(--store-text)',
                                '--tw-ring-color': 'var(--store-primary)'
                            } as React.CSSProperties}
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wide ml-1" style={{ color: 'var(--store-text)' }}>Confirmar Senha</label>
                        <input
                            type="password"
                            className="w-full border p-3.5 rounded-xl outline-none focus:ring-2 transition-all font-medium placeholder:text-gray-400"
                            style={{
                                backgroundColor: 'var(--store-bg)',
                                borderColor: 'var(--store-border)',
                                color: 'var(--store-text)',
                                '--tw-ring-color': 'var(--store-primary)'
                            } as React.CSSProperties}
                            placeholder="Repita a senha"
                            value={passwordConfirmation}
                            onChange={e => setPasswordConfirmation(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl font-bold text-base transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-4 shadow-lg hover:opacity-90"
                        style={{
                            backgroundColor: 'var(--store-primary)',
                            color: 'var(--store-primary-fg)',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Criar Conta'
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'var(--store-border)' }}>
                    <p className="text-sm" style={{ color: 'var(--store-text-muted)' }}>
                        Já tem conta?{' '}
                        <Link href={`/signin${redirectUrl ? `?redirect=${redirectUrl}` : ''}`} className="font-bold hover:underline transition-colors"
                            style={{ color: 'var(--store-text)' }}>
                            Fazer login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
