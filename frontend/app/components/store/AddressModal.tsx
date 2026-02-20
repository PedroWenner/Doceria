'use client';

import { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsCookie from 'js-cookie';
import { fetchAddressByCEP } from '@/app/services/cepService';

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    addressToEdit?: any; // If null, it's a new address
}

export default function AddressModal({ isOpen, onClose, onSave, addressToEdit }: AddressModalProps) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingCep, setIsCheckingCep] = useState(false);

    const [formData, setFormData] = useState({
        name: 'Casa',
        zip_code: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        is_default: false
    });

    useEffect(() => {
        if (addressToEdit) {
            setFormData({
                name: addressToEdit.name || 'Casa',
                zip_code: addressToEdit.zip_code || '',
                street: addressToEdit.street || '',
                number: addressToEdit.number || '',
                complement: addressToEdit.complement || '',
                neighborhood: addressToEdit.neighborhood || '',
                city: addressToEdit.city || '',
                state: addressToEdit.state || '',
                is_default: addressToEdit.is_default || false
            });
        } else {
            setFormData({
                name: 'Casa',
                zip_code: '',
                street: '',
                number: '',
                complement: '',
                neighborhood: '',
                city: '',
                state: '',
                is_default: false
            });
        }
    }, [addressToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // ViaCEP Integration
    const handleCepBlur = async () => {
        const cleanCep = formData.zip_code.replace(/\D/g, ''); // Kept formData.zip_code
        if (cleanCep.length === 8) {
            setIsCheckingCep(true);
            try {
                const addressData = await fetchAddressByCEP(cleanCep);
                if (addressData) {
                    setFormData(prev => ({
                        ...prev,
                        street: addressData.logradouro || prev.street,
                        neighborhood: addressData.bairro || prev.neighborhood,
                        city: addressData.localidade || prev.city,
                        state: addressData.uf || prev.state
                    }));
                } else {
                    toast.error('CEP não encontrado.');
                }
            } catch (error) {
                console.error("Error fetching CEP", error);
                toast.error('Erro ao buscar CEP.');
            } finally {
                setIsCheckingCep(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = jsCookie.get('store_token');

        try {
            const url = addressToEdit
                ? `${apiUrl}/addresses/${addressToEdit.id}`
                : `${apiUrl}/addresses`;
            const method = addressToEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(addressToEdit ? "Endereço atualizado!" : "Endereço adicionado!");
                onSave();
                onClose();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Erro ao salvar endereço.');
            }
        } catch (error) {
            toast.error('Erro de conexão.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleIn">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--store-text)' }}>
                        <MapPin size={20} />
                        {addressToEdit ? 'Editar Endereço' : 'Novo Endereço'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Apelido (ex: Casa)</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none"
                                style={{ borderColor: 'var(--store-border)', color: 'var(--store-text)', '--tw-ring-color': 'var(--store-text)' } as React.CSSProperties}
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">
                                CEP {isCheckingCep && <span className="animate-pulse text-[10px] ml-2 text-blue-500">buscando...</span>}
                            </label>
                            <input
                                type="text"
                                name="zip_code"
                                value={formData.zip_code}
                                onChange={handleChange}
                                onBlur={handleCepBlur}
                                placeholder="00000-000"
                                required
                                className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none"
                                style={{ borderColor: 'var(--store-border)', color: 'var(--store-text)', '--tw-ring-color': 'var(--store-text)' } as React.CSSProperties}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-4 sm:col-span-3">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Rua / Logradouro</label>
                            <input
                                type="text"
                                name="street"
                                value={formData.street}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none"
                                style={{ borderColor: 'var(--store-border)', color: 'var(--store-text)', '--tw-ring-color': 'var(--store-text)' } as React.CSSProperties}
                            />
                        </div>
                        <div className="col-span-4 sm:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Número</label>
                            <input
                                type="text"
                                name="number"
                                value={formData.number}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none"
                                style={{ borderColor: 'var(--store-border)', color: 'var(--store-text)', '--tw-ring-color': 'var(--store-text)' } as React.CSSProperties}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Complemento</label>
                            <input
                                type="text"
                                name="complement"
                                value={formData.complement}
                                onChange={handleChange}
                                placeholder="Apto, Bloco..."
                                className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none"
                                style={{ borderColor: 'var(--store-border)', color: 'var(--store-text)', '--tw-ring-color': 'var(--store-text)' } as React.CSSProperties}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Bairro</label>
                            <input
                                type="text"
                                name="neighborhood"
                                value={formData.neighborhood}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none"
                                style={{ borderColor: 'var(--store-border)', color: 'var(--store-text)', '--tw-ring-color': 'var(--store-text)' } as React.CSSProperties}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-3">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Cidade</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none"
                                style={{ borderColor: 'var(--store-border)', color: 'var(--store-text)', '--tw-ring-color': 'var(--store-text)' } as React.CSSProperties}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">UF</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                maxLength={2}
                                required
                                className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none uppercase"
                                style={{ borderColor: 'var(--store-border)', color: 'var(--store-text)', '--tw-ring-color': 'var(--store-text)' } as React.CSSProperties}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_default"
                                checked={formData.is_default}
                                onChange={handleChange}
                                className="rounded text-gray-900 focus:ring-gray-900 w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm font-medium" style={{ color: 'var(--store-text)' }}>Definir como endereço principal</span>
                        </label>
                    </div>

                    <div className="pt-4 border-t mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 font-bold text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 rounded-lg font-bold text-sm transition-opacity hover:opacity-90 flex items-center justify-center min-w-[120px]"
                            style={{ backgroundColor: 'var(--store-primary)', color: 'var(--store-primary-fg)' }}
                        >
                            {isSubmitting ? <span className="animate-spin">🍩</span> : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
