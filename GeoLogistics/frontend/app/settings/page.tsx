'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { Settings, Save, ArrowLeft, Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tenantId, setTenantId] = useState('');
    const [tenantName, setTenantName] = useState('');
    const [formData, setFormData] = useState({
        base_fare: 0,
        price_per_km: 0,
        price_per_min: 0,
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const router = useRouter();

    useEffect(() => {
        const storedId = localStorage.getItem('tenant_id');
        const storedName = localStorage.getItem('tenant_name');

        if (!storedId) {
            router.push('/login');
            return;
        }

        setTenantId(storedId);
        setTenantName(storedName || 'Empresa');
        fetchSettings(storedId);
    }, [router]);

    const fetchSettings = async (id: string) => {
        try {
            const response = await api.get(`/tenants/${id}`);
            const { base_fare, price_per_km, price_per_min } = response.data;
            setFormData({
                base_fare: Number(base_fare),
                price_per_km: Number(price_per_km),
                price_per_min: Number(price_per_min),
            });
        } catch (error) {
            console.error('Failed to fetch settings', error);
            setMessage({ type: 'error', text: 'Erro ao carregar configurações.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        console.log(`[SettingsPage] Saving settings for tenant ${tenantId}`, formData);

        try {
            const url = `/tenants/${tenantId}`;
            console.log(`[SettingsPage] PATCH ${url}`);
            await api.patch(url, formData);
            setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
        } catch (error: any) {
            console.error('Failed to save settings', error);
            const errorMsg = error.response?.data?.message || error.message || 'Erro desconhecido';
            setMessage({ type: 'error', text: `Erro ao salvar: ${errorMsg}` });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0,
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-6 flex justify-center">
            <div className="w-full max-w-2xl">
                <header className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-zinc-200"
                    >
                        <ArrowLeft className="w-5 h-5 text-zinc-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-800 flex items-center gap-2">
                            <Settings className="w-6 h-6 text-emerald-600" />
                            Configurações de Preço
                        </h1>
                        <p className="text-zinc-500 text-sm">Defina as regras de cobrança para {tenantName}</p>
                    </div>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">

                        {message.text && (
                            <div className={`p-4 rounded-lg text-sm border ${message.type === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700">Tarifa Base (R$)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-zinc-400 text-sm">R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="base_fare"
                                        value={formData.base_fare}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                                <p className="text-xs text-zinc-500">Valor fixo cobrado por pedido.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700">Preço por Km</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-zinc-400 text-sm">R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="price_per_km"
                                        value={formData.price_per_km}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                                <p className="text-xs text-zinc-500">Adicional por quilômetro rodado.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700">Preço por Minuto</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-zinc-400 text-sm">R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="price_per_min"
                                        value={formData.price_per_min}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                                <p className="text-xs text-zinc-500">Adicional por tempo de trajeto.</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-zinc-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
