'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { Building2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [slug, setSlug] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.get(`/tenants?slug=${slug}`);
            const tenants = response.data;

            if (tenants.length > 0) {
                const tenant = tenants[0];
                // In a real app, we would store a token. For MVP, we store the ID.
                localStorage.setItem('tenant_id', tenant.id);
                localStorage.setItem('tenant_name', tenant.name);
                router.push('/dashboard');
            } else {
                setError('Empresa não encontrada.');
            }
        } catch (err) {
            setError('Erro ao conectar com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
            <div className="w-full max-w-md p-8 bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-emerald-500/10 p-4 rounded-full mb-4">
                        <Building2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                        GeoLogistics
                    </h1>
                    <p className="text-zinc-400 text-sm mt-2">Acesse o painel da sua empresa</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium text-zinc-400 mb-1.5">
                            Identificador da Empresa (Slug)
                        </label>
                        <input
                            type="text"
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none text-white placeholder-zinc-600"
                            placeholder="ex: doceria-final"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Acessando...' : 'Acessar Painel'}
                        {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-zinc-500">
                        Ainda não tem conta? <span className="text-emerald-500 cursor-pointer hover:underline">Entre em contato</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
