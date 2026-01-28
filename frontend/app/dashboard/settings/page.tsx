'use client';

import { useState, useEffect } from 'react';
import GlassCard from '@/app/components/GlassCard';
import Cookies from 'js-cookie';
import { useLanguage } from '@/app/context/LanguageContext';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { formatCEP, formatCNPJ, formatPhone } from '@/app/utils/formatters';
import { fetchAddressByCEP } from '@/app/services/cepService';
import { fetchCompanyByCNPJ } from '@/app/services/cnpjService';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'operational' | 'fiscal' | 'address' | 'system'>('general');

    // Services Loading States
    const [isSearchingCep, setIsSearchingCep] = useState(false);
    const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);

    const [formData, setFormData] = useState({
        // General
        system_name: '', description: '', brand_color: '',
        // Visual
        logo_url: '', login_bg_url: '', welcome_message: '',
        // Fiscal
        cnpj: '', state_registration: '', municipal_registration: '', fiscal_regime: '',
        // Address
        street: '', number: '', neighborhood: '', city: '', state: '', zip_code: '',
        // System
        orders_refresh_rate: 60, auth_token_expiration: 60,
        // Operational
        enable_stock_control: true, global_min_stock: 5,
        currency_symbol: 'R$', whatsapp_number: '', delivery_message: ''
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
                setFormData(prev => ({
                    ...prev,
                    ...response.data,
                    // Ensure defaults
                    orders_refresh_rate: response.data.orders_refresh_rate || 60,
                    auth_token_expiration: response.data.auth_token_expiration || 60,
                    enable_stock_control: response.data.enable_stock_control ?? true,
                    global_min_stock: response.data.global_min_stock || 5,
                    currency_symbol: response.data.currency_symbol || 'R$'
                }));
            } else {
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
        let value: any = e.target.value;
        const name = e.target.name;
        const type = e.target.type;

        // Handle checkbox
        if (type === 'checkbox') {
            value = (e.target as HTMLInputElement).checked;
        }

        if (name === 'zip_code') value = formatCEP(value);
        if (name === 'cnpj') value = formatCNPJ(value);
        if (name === 'whatsapp_number') value = formatPhone(value);

        setFormData({ ...formData, [name]: value });
    };

    const handleBlurCEP = async () => {
        const cep = formData.zip_code.replace(/\D/g, '');
        if (cep.length === 8) {
            setIsSearchingCep(true);
            const address = await fetchAddressByCEP(cep);
            setIsSearchingCep(false);

            if (address) {
                setFormData(prev => ({
                    ...prev,
                    street: address.logradouro,
                    neighborhood: address.bairro,
                    city: address.localidade,
                    state: address.uf
                }));
                toast.success('Endereço encontrado! 🗺️');
            } else {
                toast.error('CEP não encontrado.');
            }
        }
    };

    const handleBlurCNPJ = async () => {
        const cnpj = formData.cnpj.replace(/\D/g, '');
        if (cnpj.length === 14) {
            setIsSearchingCnpj(true);
            const company = await fetchCompanyByCNPJ(cnpj);
            setIsSearchingCnpj(false);

            if (company) {
                setFormData(prev => ({
                    ...prev,
                    system_name: company.nome_fantasia || company.razao_social,
                    zip_code: formatCEP(company.cep),
                    street: company.logradouro,
                    number: company.numero,
                    neighborhood: company.bairro,
                    city: company.municipio,
                    state: company.uf
                }));
                toast.success('Dados da empresa carregados! 🏢');
            } else {
                toast.error('CNPJ não encontrado na Receita.');
            }
        }
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

    const tabs = [
        { id: 'general', label: 'Geral', icon: '🏢' },
        { id: 'operational', label: 'Operacional', icon: '🏭' }, // New tab
        { id: 'fiscal', label: 'Fiscal', icon: '⚖️' },
        { id: 'address', label: 'Endereço', icon: '📍' },
        { id: 'system', label: 'Sistema', icon: '⚙️' },
    ];

    return (
        <form onSubmit={handleSubmit} className="pb-10 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-brand-choco mb-6 flex items-center gap-2">
                ⚙️ {t('settings.title')}
            </h1>

            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 mb-6 p-1 bg-white/30 backdrop-blur-sm rounded-xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all flex-1 justify-center
                            ${activeTab === tab.id
                                ? 'bg-brand-pink text-white shadow-lg scale-105'
                                : 'text-brand-choco/70 hover:bg-white/50 hover:text-brand-choco'
                            }
                        `}
                    >
                        <span>{tab.icon}</span>
                        <span>{t(`settings.${tab.id}.title`) || tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                {/* General Section */}
                {activeTab === 'general' && (
                    <GlassCard className="p-6 animate-fadeIn">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.general.name')}</label>
                                <input
                                    name="system_name"
                                    value={formData.system_name}
                                    onChange={handleChange}
                                    disabled={isSearchingCnpj}
                                    className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 disabled:opacity-50 focus:ring-2 focus:ring-brand-pink/50 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.general.brand_color')}</label>
                                <div className="flex gap-2">
                                    <input type="color" name="brand_color" value={formData.brand_color} onChange={handleChange} className="h-12 w-20 rounded-xl cursor-pointer shadow-sm border border-brand-gold/30" />
                                    <input name="brand_color" value={formData.brand_color} onChange={handleChange} className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none" />
                                </div>
                            </div>
                            <div className="col-span-full">
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.general.description')}</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none focus:ring-2 focus:ring-brand-pink/50" />
                            </div>

                            {/* Visual Settings */}
                            <div className="col-span-full border-t border-brand-gold/20 pt-4 mt-2">
                                <h3 className="font-bold text-brand-choco mb-4 flex items-center gap-2">🎨 {t('settings.visual.title')}</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.visual.logo_url')}</label>
                                        <input name="logo_url" value={formData.logo_url || ''} onChange={handleChange} className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none" placeholder="https://..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.visual.bg_url')}</label>
                                        <input name="login_bg_url" value={formData.login_bg_url || ''} onChange={handleChange} className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none" placeholder="https://..." />
                                    </div>
                                    <div className="col-span-full">
                                        <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.visual.welcome')}</label>
                                        <input name="welcome_message" value={formData.welcome_message || ''} onChange={handleChange} className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                )}

                {/* Operational Section */}
                {activeTab === 'operational' && (
                    <GlassCard className="p-6 animate-fadeIn">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold text-brand-choco mb-4">📦 Estoque</h3>
                                <div className="flex items-center gap-3 mb-4 p-3 bg-white/40 rounded-xl">
                                    <input
                                        type="checkbox"
                                        name="enable_stock_control"
                                        checked={formData.enable_stock_control}
                                        onChange={handleChange}
                                        className="w-6 h-6 text-brand-pink rounded focus:ring-brand-pink cursor-pointer"
                                    />
                                    <label className="font-bold text-brand-choco cursor-pointer">{t('settings.operational.enable_stock')}</label>
                                </div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.operational.min_stock')}</label>
                                <input
                                    type="number"
                                    name="global_min_stock"
                                    value={formData.global_min_stock}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none"
                                />
                            </div>

                            <div>
                                <h3 className="font-bold text-brand-choco mb-4">💬 Integrações</h3>
                                <div className="grid gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.operational.currency')}</label>
                                        <input name="currency_symbol" value={formData.currency_symbol} onChange={handleChange} className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.operational.whatsapp')}</label>
                                        <input name="whatsapp_number" value={formData.whatsapp_number || ''} onChange={handleChange} className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none" placeholder="5511999999999" />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.operational.delivery_msg')}</label>
                                <textarea
                                    name="delivery_message"
                                    value={formData.delivery_message || ''}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Olá! Seu pedido saiu para entrega..."
                                    className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none focus:ring-2 focus:ring-brand-pink/50"
                                />
                            </div>
                        </div>
                    </GlassCard>
                )}

                {/* Fiscal Section */}
                {activeTab === 'fiscal' && (
                    <GlassCard className="p-6 animate-fadeIn">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.fiscal.cnpj')}</label>
                                <div className="relative">
                                    <input
                                        name="cnpj"
                                        value={formData.cnpj || ''}
                                        onChange={handleChange}
                                        onBlur={handleBlurCNPJ}
                                        placeholder="00.000.000/0000-00"
                                        className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none focus:ring-2 focus:ring-brand-pink/50"
                                    />
                                    {isSearchingCnpj && (
                                        <span className="absolute right-3 top-3 text-lg animate-spin">⏳</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.fiscal.regime')}</label>
                                <input name="fiscal_regime" value={formData.fiscal_regime || ''} onChange={handleChange} className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.fiscal.ie')}</label>
                                <input name="state_registration" value={formData.state_registration || ''} onChange={handleChange} className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.fiscal.im')}</label>
                                <input name="municipal_registration" value={formData.municipal_registration || ''} onChange={handleChange} className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none" />
                            </div>
                        </div>
                    </GlassCard>
                )}

                {/* Address Section */}
                {activeTab === 'address' && (
                    <GlassCard className="p-6 animate-fadeIn">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.address.zip')}</label>
                                <div className="relative">
                                    <input
                                        name="zip_code"
                                        value={formData.zip_code || ''}
                                        onChange={handleChange}
                                        onBlur={handleBlurCEP}
                                        placeholder="00000-000"
                                        className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none focus:ring-2 focus:ring-brand-pink/50"
                                    />
                                    {isSearchingCep && (
                                        <span className="absolute right-3 top-3 text-lg animate-spin">⏳</span>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.address.street')}</label>
                                <input
                                    name="street"
                                    value={formData.street || ''}
                                    onChange={handleChange}
                                    disabled={isSearchingCep}
                                    className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.address.number')}</label>
                                <input name="number" value={formData.number || ''} onChange={handleChange} className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.address.neighborhood')}</label>
                                <input
                                    name="neighborhood"
                                    value={formData.neighborhood || ''}
                                    onChange={handleChange}
                                    disabled={isSearchingCep}
                                    className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.address.city')}</label>
                                <input
                                    name="city"
                                    value={formData.city || ''}
                                    onChange={handleChange}
                                    disabled={isSearchingCep}
                                    className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">{t('settings.address.state')}</label>
                                <input
                                    name="state"
                                    value={formData.state || ''}
                                    onChange={handleChange}
                                    disabled={isSearchingCep}
                                    maxLength={2}
                                    className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 uppercase disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </GlassCard>
                )}

                {/* System Section */}
                {activeTab === 'system' && (
                    <GlassCard className="p-6 animate-fadeIn">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-brand-choco mb-1">
                                    ⏱️ {t('settings.system.refresh_rate')}
                                </label>
                                <p className="text-xs text-brand-choco/70 mb-2">
                                    {t('settings.system.refresh_rate_hint')}
                                </p>
                                <input
                                    type="number"
                                    name="orders_refresh_rate"
                                    value={formData.orders_refresh_rate}
                                    onChange={handleChange}
                                    min="10"
                                    max="3600"
                                    className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none focus:ring-2 focus:ring-brand-pink/50 mb-6"
                                />

                                <label className="block text-sm font-bold text-brand-choco mb-1">
                                    🔑 {t('settings.system.token_expiration')}
                                </label>
                                <p className="text-xs text-brand-choco/70 mb-2">
                                    {t('settings.system.token_expiration_hint')}
                                </p>
                                <input
                                    type="number"
                                    name="auth_token_expiration"
                                    value={formData.auth_token_expiration || ''}
                                    onChange={handleChange}
                                    min="5"
                                    max="43200"
                                    className="w-full p-3 rounded-xl bg-white/50 border border-brand-gold/30 outline-none focus:ring-2 focus:ring-brand-pink/50"
                                />
                            </div>
                            <div>
                                <div className="p-4 bg-brand-gold/10 rounded-xl border border-brand-gold/30">
                                    <h3 className="font-bold text-brand-choco mb-2">📧 {t('settings.system.email_config')}</h3>
                                    <p className="text-sm text-brand-choco/80">
                                        {t('settings.system.email_hint')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                )}
            </div>

            <div className="flex justify-end mt-6">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-brand-choco text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <span className="animate-spin">🔄</span> {t('common.saving')}
                        </>
                    ) : (
                        <>{t('settings.save_btn')}</>
                    )}
                </button>
            </div>
        </form>
    );
}
