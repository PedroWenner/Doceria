'use client';

import { useEffect, useState } from 'react';
import { useStoreAuth } from '@/app/context/StoreAuthContext';
import { useRouter } from 'next/navigation';
import jsCookie from 'js-cookie';
import { toast } from 'react-hot-toast';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase, Map } from 'lucide-react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import AddressModal from '@/app/components/store/AddressModal';

interface Address {
    id: number;
    name: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    is_default: boolean;
    latitude?: number;
    longitude?: number;
}

export default function AddressesPage() {
    const { user, isLoading: isAuthReady } = useStoreAuth();
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    useEffect(() => {
        if (!isAuthReady) return;

        if (!user) {
            router.push('/signin?redirect=/profile/addresses');
            return;
        }

        fetchAddresses();
    }, [user, isAuthReady, router]);

    const fetchAddresses = async () => {
        setIsLoading(true);
        const token = jsCookie.get('store_token');
        try {
            const res = await fetch(`${apiUrl}/addresses`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setAddresses(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
            toast.error('Erro ao carregar endereços.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este endereço?')) return;

        const token = jsCookie.get('store_token');
        try {
            const res = await fetch(`${apiUrl}/addresses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                toast.success('Endereço excluído!');
                fetchAddresses();
            } else {
                toast.error('Erro ao excluir endereço.');
            }
        } catch (error) {
            toast.error('Erro de conexão.');
        }
    };

    const handleSetDefault = async (address: Address) => {
        if (address.is_default) return;

        const token = jsCookie.get('store_token');
        try {
            const res = await fetch(`${apiUrl}/addresses/${address.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ ...address, is_default: true })
            });

            if (res.ok) {
                toast.success('Endereço principal atualizado!');
                fetchAddresses();
            } else {
                toast.error('Erro ao atualizar endereço principal.');
            }
        } catch (error) {
            toast.error('Erro de conexão.');
        }
    };

    const openAddModal = () => {
        setAddressToEdit(null);
        setIsModalOpen(true);
    };

    const openEditModal = (address: Address) => {
        setAddressToEdit(address);
        setIsModalOpen(true);
    };

    const getIconForName = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('casa')) return <Home size={20} />;
        if (lowerName.includes('trabalho')) return <Briefcase size={20} />;
        return <MapPin size={20} />;
    };

    if (!isAuthReady || isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fadeIn" style={{ backgroundColor: 'var(--store-bg)' }}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--store-text)' }}>Meus Endereços</h1>
                    <p className="text-sm" style={{ color: 'var(--store-text-muted)' }}>Gerencie seus endereços para entrega.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-transform hover:scale-105"
                    style={{ backgroundColor: 'var(--store-primary)', color: 'var(--store-primary-fg)' }}
                >
                    <Plus size={18} />
                    Novo Endereço
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--store-border)', backgroundColor: 'var(--store-card)' }}>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-gray-50/50">
                        <Map size={40} className="opacity-20" style={{ color: 'var(--store-text)' }} />
                    </div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--store-text)' }}>Nenhum endereço salvo</h2>
                    <p className="max-w-md mb-6 text-sm" style={{ color: 'var(--store-text-muted)' }}>Adicione seu primeiro endereço para receber deliciosos pedidos no conforto da sua casa ou trabalho.</p>
                    <button
                        onClick={openAddModal}
                        className="px-6 py-3 rounded-xl font-bold transition-all shadow-sm hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: 'var(--store-text)', color: 'var(--store-bg)' }}
                    >
                        Criar meu primeiro endereço
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all overflow-hidden ${address.is_default ? 'shadow-md' : 'shadow-sm hover:border-gray-300'}`}
                            style={{
                                backgroundColor: 'var(--store-card)',
                                borderColor: address.is_default ? 'var(--store-primary)' : 'var(--store-border)'
                            }}
                        >
                            {/* Default Badge */}
                            {address.is_default && (
                                <div className="absolute top-0 right-0 px-3 py-1 bg-opacity-10 rounded-bl-xl font-bold text-[10px] uppercase tracking-wider"
                                    style={{ backgroundColor: 'var(--store-primary)', color: 'var(--store-primary-fg)' }}>
                                    Principal
                                </div>
                            )}

                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: 'var(--store-bg)', color: 'var(--store-primary)' }}>
                                    {getIconForName(address.name)}
                                </div>
                                <h3 className="font-bold text-lg" style={{ color: 'var(--store-text)' }}>{address.name}</h3>
                            </div>

                            {/* Address Details */}
                            <div className="flex-1 space-y-1 mb-6 text-sm" style={{ color: 'var(--store-text-muted)' }}>
                                <p className="font-medium" style={{ color: 'var(--store-text)' }}>{address.street}, {address.number}</p>
                                {address.complement && <p>{address.complement}</p>}
                                <p>{address.neighborhood}</p>
                                <p>{address.city} - {address.state}</p>
                                <p className="pt-2 font-mono text-xs opacity-80">{address.zip_code}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between border-t pt-4 mt-auto gap-2" style={{ borderColor: 'var(--store-border)' }}>
                                {!address.is_default ? (
                                    <button
                                        onClick={() => handleSetDefault(address)}
                                        className="text-xs font-bold hover:underline"
                                        style={{ color: 'var(--store-primary)' }}
                                    >
                                        Tornar principal
                                    </button>
                                ) : (
                                    <span className="text-xs font-medium opacity-50 flex items-center gap-1" style={{ color: 'var(--store-text)' }}>
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--store-primary)' }}></div>
                                        Padrão para entregas
                                    </span>
                                )}

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openEditModal(address)}
                                        className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                        title="Editar"
                                        style={{ color: 'var(--store-text-muted)' }}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address.id)}
                                        className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                                        title="Excluir"
                                        style={{ color: 'var(--store-text-muted)' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddressModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchAddresses}
                addressToEdit={addressToEdit}
            />
        </div>
    );
}
