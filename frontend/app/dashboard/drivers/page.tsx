'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import {
    Plus,
    Truck,
    User,
    XCircle,
    MapPin,
    Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Driver {
    id: string;
    name: string;
    type: 'OWN_FLEET' | 'FREELANCER';
    status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
    latitude?: number;
    longitude?: number;
}

export default function DriversPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: 'OWN_FLEET'
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = Cookies.get('admin_token');

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const res = await fetch(`${apiUrl}/drivers`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (res.ok) {
                const response = await res.json();
                setDrivers(response.data);
            } else {
                // If 403, it might mean contract invalid
                if (res.status === 403) {
                    toast.error('Acesso negado: Verifique o contrato de logística.');
                }
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            toast.error('Erro ao carregar motoristas.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const res = await fetch(`${apiUrl}/drivers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Motorista cadastrado com sucesso!');
                setIsModalOpen(false);
                setFormData({ name: '', type: 'OWN_FLEET' });
                fetchDrivers();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Erro ao cadastrar motorista.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro de conexão.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                        <Truck className="text-slate-400" />
                        Motoristas
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Gerencie sua frota própria e parceiros.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-choco text-white rounded-lg hover:bg-brand-choco/90 transition-colors"
                >
                    <Plus size={20} />
                    <span>Novo Motorista</span>
                </button>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Nome</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Localização Última</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {drivers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Truck size={48} className="text-slate-200 dark:text-slate-700" />
                                            <p>Nenhum motorista encontrado.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                drivers.map((driver) => (
                                    <tr key={driver.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                    <User size={16} />
                                                </div>
                                                {driver.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${driver.type === 'OWN_FLEET'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                }`}>
                                                {driver.type === 'OWN_FLEET' ? 'Frota Própria' : 'Parceiro'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${driver.status === 'AVAILABLE'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : driver.status === 'BUSY'
                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${driver.status === 'AVAILABLE' ? 'bg-emerald-500' :
                                                    driver.status === 'BUSY' ? 'bg-amber-500' : 'bg-slate-400'
                                                    }`} />
                                                {driver.status === 'AVAILABLE' ? 'Disponível' :
                                                    driver.status === 'BUSY' ? 'Em Rota' : 'Offline'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                                            {driver.latitude && driver.longitude ? (
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    {Number(driver.latitude).toFixed(4)}, {Number(driver.longitude).toFixed(4)}
                                                </div>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Novo Motorista</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-choco focus:outline-none"
                                    placeholder="Ex: João da Silva"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Vínculo</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'OWN_FLEET' })}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${formData.type === 'OWN_FLEET'
                                            ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
                                            }`}
                                    >
                                        Frota Própria
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'FREELANCER' })}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${formData.type === 'FREELANCER'
                                            ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
                                            }`}
                                    >
                                        Parceiro
                                    </button>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 text-sm font-medium text-white bg-brand-choco hover:bg-brand-choco/90 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSaving ?
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
                                        <><Check size={18} /> {t('common.save')}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
