'use client';

import { useState, useEffect } from 'react';
import GlassCard from '@/app/components/GlassCard';
import Cookies from 'js-cookie';
import { useLanguage } from '@/app/context/LanguageContext';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        system_name: '', description: '', brand_color: '',
        cnpj: '', state_registration: '', municipal_registration: '', fiscal_regime: '',
        street: '', number: '', neighborhood: '', city: '', state: '', zip_code: ''
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = Cookies.get('auth_token');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${apiUrl}/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const response = await res.json();
                setFormData(response.data);
            } else {
                console.error('Failed to fetch settings:', await res.text());
                toast.error(`Erro ao carregar configurações: ${res.status}`);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            toast.error('Erro de conexão ao carregar configurações.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`${apiUrl}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success(t('settings.success'));
            }
        } catch (error) {
            toast.error('Error saving settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <form onSubmit={handleSubmit} className="pb-10">
            <h1 className="text-3xl font-bold text-brand-choco mb-6 flex items-center gap-2">
                ⚙️ {t('settings.title')}
            </h1>

            <div className="grid grid-cols-1 gap-6">
                {/* General Section */}
                <GlassCard className="p-6">
                    <h2 className="text-xl font-bold text-brand-pink mb-4 border-b border-white/20 pb-2">
                        {t('settings.general.title')}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.general.name')}</label>
                            <input name="system_name" value={formData.system_name} onChange={handleChange} className="w-full p-2 rounded bg-white/50 border border-brand-gold/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.general.brand_color')}</label>
                            <div className="flex gap-2">
                                <input type="color" name="brand_color" value={formData.brand_color} onChange={handleChange} className="h-10 w-20 rounded cursor-pointer" />
                                <input name="brand_color" value={formData.brand_color} onChange={handleChange} className="w-full p-2 rounded bg-white/50 border border-brand-gold/30" />
                            </div>
                        </div>
                        <div className="col-span-full">
                            <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.general.description')}</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full p-2 rounded bg-white/50 border border-brand-gold/30" />
                        </div>
                    </div>
                </GlassCard>

                {/* Fiscal Section */}
                <GlassCard className="p-6">
                    <h2 className="text-xl font-bold text-brand-pink mb-4 border-b border-white/20 pb-2">
                        {t('settings.fiscal.title')}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.fiscal.cnpj')}</label>
                            <input name="cnpj" value={formData.cnpj || ''} onChange={handleChange} className="w-full p-2 rounded bg-white/50 border border-brand-gold/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.fiscal.regime')}</label>
                            <input name="fiscal_regime" value={formData.fiscal_regime || ''} onChange={handleChange} className="w-full p-2 rounded bg-white/50 border border-brand-gold/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.fiscal.ie')}</label>
                            <input name="state_registration" value={formData.state_registration || ''} onChange={handleChange} className="w-full p-2 rounded bg-white/50 border border-brand-gold/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.fiscal.im')}</label>
                            <input name="municipal_registration" value={formData.municipal_registration || ''} onChange={handleChange} className="w-full p-2 rounded bg-white/50 border border-brand-gold/30" />
                        </div>
                    </div>
                </GlassCard>

                {/* Address Section */}
                <GlassCard className="p-6">
                    <h2 className="text-xl font-bold text-brand-pink mb-4 border-b border-white/20 pb-2">
                        {t('settings.address.title')}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.address.zip')}</label>
                            <input name="zip_code" value={formData.zip_code || ''} onChange={handleChange} className="w-full p-2 rounded bg-white/50 border border-brand-gold/30" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.address.street')}</label>
                            <input name="street" value={formData.street || ''} onChange={handleChange} className="w-full p-2 rounded bg-white/50 border border-brand-gold/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.address.number')}</label>
                            <input name="number" value={formData.number || ''} onChange={handleChange} className="w-full p-2 rounded bg-white/50 border border-brand-gold/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.address.neighborhood')}</label>
                            <input name="neighborhood" value={formData.neighborhood || ''} onChange={handleChange} className="w-full p-2 rounded bg-white/50 border border-brand-gold/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.address.city')}</label>
                            <input name="city" value={formData.city || ''} onChange={handleChange} className="w-full p-2 rounded bg-white/50 border border-brand-gold/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.address.state')}</label>
                            <input name="state" value={formData.state || ''} onChange={handleChange} maxLength={2} className="w-full p-2 rounded bg-white/50 border border-brand-gold/30 uppercase" />
                        </div>
                    </div>
                </GlassCard>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-brand-choco text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Salvar Configurações 💾'}
                    </button>
                </div>
            </div>
        </form>
    );
}
