'use client';

import { useState, useEffect } from 'react';
import GlassCard from '@/app/components/GlassCard';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { useAdminAuth } from '@/app/context/AdminAuthContext';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

interface PaymentMethod {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
}

export default function PaymentMethodsPage() {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = Cookies.get('admin_token');

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        try {
            const res = await fetch(`${apiUrl}/payment-methods/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setMethods(data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar meios de pagamento');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = async (id: number) => {
        try {
            const res = await fetch(`${apiUrl}/payment-methods/${id}/toggle`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Status atualizado');
                fetchMethods();
            }
        } catch (error) {
            toast.error('Erro ao atualizar status');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza? Isso removerá descontos associados a este método.')) return;

        try {
            const res = await fetch(`${apiUrl}/payment-methods/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Removido com sucesso');
                fetchMethods();
            }
        } catch (error) {
            toast.error('Erro ao remover');
        }
    };

    const openModal = (method?: PaymentMethod) => {
        if (method) {
            setEditingMethod(method);
            setName(method.name);
            setSlug(method.slug);
        } else {
            setEditingMethod(null);
            setName('');
            setSlug('');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const url = editingMethod
                ? `${apiUrl}/payment-methods/${editingMethod.id}`
                : `${apiUrl}/payment-methods`;

            const method = editingMethod ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, slug })
            });

            if (res.ok) {
                toast.success(editingMethod ? 'Atualizado!' : 'Criado!');
                setIsModalOpen(false);
                fetchMethods();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Erro ao salvar');
            }
        } catch (error) {
            toast.error('Erro de conexão');
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-generate slug
    const handleNameChange = (val: string) => {
        setName(val);
        if (!editingMethod) {
            setSlug(val.toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '_'));
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-choco flex items-center gap-2">
                    💳 Meios de Pagamento
                </h1>
                <button
                    onClick={() => openModal()}
                    className="bg-brand-choco text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-brand-choco/90 transition-all"
                >
                    + Novo Meio
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {methods.map(method => (
                    <GlassCard key={method.id} className="p-5 flex flex-col justify-between group">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-brand-choco">{method.name}</h3>
                                <div className={`px-2 py-0.5 rounded text-xs font-bold ${method.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {method.is_active ? 'Ativo' : 'Inativo'}
                                </div>
                            </div>
                            <p className="text-xs text-brand-choco/60 font-mono bg-white/50 inline-block px-2 py-1 rounded mb-4">
                                {method.slug}
                            </p>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-brand-gold/10">
                            <button
                                onClick={() => handleToggle(method.id)}
                                className="flex-1 text-sm font-bold text-brand-choco/70 hover:text-brand-choco bg-white/40 hover:bg-white/60 py-2 rounded transition-colors"
                            >
                                {method.is_active ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                                onClick={() => openModal(method)}
                                className="px-3 text-brand-choco/70 hover:text-brand-pink bg-white/40 hover:bg-white/60 rounded transition-colors"
                            >
                                ✏️
                            </button>
                            <button
                                onClick={() => handleDelete(method.id)}
                                className="px-3 text-brand-choco/70 hover:text-red-600 bg-white/40 hover:bg-white/60 rounded transition-colors"
                            >
                                🗑️
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <GlassCard className="w-full max-w-md p-6 animate-scaleIn">
                        <h2 className="text-2xl font-bold text-brand-choco mb-4">
                            {editingMethod ? 'Editar Meio' : 'Novo Meio'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">Nome</label>
                                <input
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none focus:ring-2 focus:ring-brand-pink/50"
                                    placeholder="Ex: Pix"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">Slug (Código)</label>
                                <input
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none focus:ring-2 focus:ring-brand-pink/50 font-mono text-sm"
                                    placeholder="Ex: pix"
                                    required
                                />
                                <p className="text-xs text-brand-choco/50 mt-1">Identificador único usado pelo sistema.</p>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-brand-choco hover:bg-white/40 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-brand-choco text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-brand-choco/90 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
