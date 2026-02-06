'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useLanguage } from '@/app/context/LanguageContext';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { formatCEP, formatCNPJ, formatPhone } from '@/app/utils/formatters';
import { fetchAddressByCEP } from '@/app/services/cepService';
import { fetchCompanyByCNPJ } from '@/app/services/cnpjService';
import toast from 'react-hot-toast';
import {
    Settings,
    Building2,
    Truck,
    Wallet,
    MapPin,
    Save,
    Loader2,
    Info,
    Mail,
    Phone,
    Package,
    Globe,
    Layout,
    Clock,
    Key,
    UserCircle,
    Image as ImageIcon,
    CreditCard
} from 'lucide-react';
import LocationMap from '@/app/components/LocationMap';
import UnifiedPaymentForm from '@/app/components/UnifiedPaymentForm';

export default function SettingsPage() {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'operational' | 'fiscal' | 'address' | 'system' | 'payments'>('general');

    // Payment Settings State
    interface PaymentGatewaySetting {
        id: number;
        payment_method_id: number;
        mode: 'sandbox' | 'production';
        is_active: boolean;
        credentials: any;
    }

    interface PaymentMethod {
        id: number;
        name: string;
        slug: string;
        gateway_setting?: PaymentGatewaySetting;
    }

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(false);

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
        orders_refresh_rate: 60, auth_token_expiration: 60, pagination_limit: 10,
        // Operational
        enable_stock_control: true, global_min_stock: 5,
        whatsapp_number: '', delivery_message: '',
        latitude: '', longitude: ''
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [bgFile, setBgFile] = useState<File | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = Cookies.get('admin_token');

    useEffect(() => {
        fetchSettings();
        if (activeTab === 'payments') {
            fetchPaymentSettings();
        }
    }, [activeTab]);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${apiUrl}/settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (res.ok) {
                const response = await res.json();
                setFormData(prev => ({
                    ...prev,
                    ...response.data,
                    // Ensure defaults
                    orders_refresh_rate: response.data.orders_refresh_rate || 60,
                    auth_token_expiration: response.data.auth_token_expiration || 60,
                    pagination_limit: response.data.pagination_limit || 10,
                    enable_stock_control: response.data.enable_stock_control ?? true,
                    global_min_stock: response.data.global_min_stock || 5,
                    latitude: response.data.latitude || '',
                    longitude: response.data.longitude || ''
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

    const fetchPaymentSettings = async () => {
        setLoadingPayments(true);
        try {
            const res = await fetch(`${apiUrl}/payment-gateway-settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (res.ok) {
                const response = await res.json();
                setPaymentMethods(response.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar configurações de pagamento');
        } finally {
            setLoadingPayments(false);
        }
    };

    const handlePaymentSettingChange = (methodId: number, field: string, value: any) => {
        setPaymentMethods(prev => prev.map(method => {
            if (method.id === methodId) {
                const currentSettings = method.gateway_setting || { mode: 'sandbox', is_active: false, credentials: {} };

                if (field === 'mode' || field === 'is_active') {
                    return { ...method, gateway_setting: { ...currentSettings, [field]: value } as PaymentGatewaySetting };
                } else {
                    // Credentials update
                    return {
                        ...method,
                        gateway_setting: {
                            ...currentSettings,
                            credentials: { ...currentSettings.credentials, [field]: value }
                        } as PaymentGatewaySetting
                    };
                }
            }
            return method;
        }));
    };

    const savePaymentSettings = async (methodId: number) => {
        const method = paymentMethods.find(m => m.id === methodId);
        if (!method || !method.gateway_setting) return;

        try {
            const res = await fetch(`${apiUrl}/payment-gateway-settings/${methodId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(method.gateway_setting)
            });

            if (res.ok) {
                toast.success('Configurações de pagamento salvas!');
                fetchPaymentSettings(); // Refresh to clean state/dirty flags if needed
            } else {
                toast.error('Erro ao salvar configurações.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro de conexão.');
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'bg') => {
        if (e.target.files && e.target.files[0]) {
            if (type === 'logo') setLogoFile(e.target.files[0]);
            if (type === 'bg') setBgFile(e.target.files[0]);
        }
    };

    const handleBlurCEP = async () => {
        const cep = formData.zip_code.replace(/\D/g, '');
        if (cep.length === 8) {
            setIsSearchingCep(true);
            const address = await fetchAddressByCEP(cep);
            setIsSearchingCep(false);

            if (address) {
                // If we have access to a Geocoding API, we could get coords from address here.
                // For now, we just fill the address fields.
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

    const handleLocationChange = (lat: number, lng: number) => {
        setFormData(prev => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString()
        }));
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
            const data = new FormData();

            // Append Text Fields
            Object.keys(formData).forEach(key => {
                const value = (formData as any)[key];
                if (typeof value === 'boolean') {
                    data.append(key, value ? '1' : '0');
                } else if (value !== null && value !== undefined) {
                    if (key !== 'logo_url' && key !== 'login_bg_url') {
                        data.append(key, value);
                    }
                }
            });

            // Append Files
            if (logoFile) data.append('logo_url', logoFile);
            if (bgFile) data.append('login_bg_url', bgFile);

            const res = await fetch(`${apiUrl}/settings?_method=PUT`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: data
            });

            if (res.ok) {
                toast.success(t('settings.success'));
                await fetchSettings();
                setLogoFile(null);
                setBgFile(null);
            } else {
                try {
                    const err = await res.json();
                    console.error(err);
                    toast.error(`Erro ao salvar: ${err.message || 'Validation'}`);
                } catch {
                    toast.error('Erro ao salvar configurações.');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Error saving settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    const tabs = [
        { id: 'general', label: 'Geral', icon: Layout },
        { id: 'operational', label: 'Operacional', icon: Package },
        { id: 'fiscal', label: 'Fiscal', icon: Wallet },
        { id: 'address', label: 'Endereço', icon: MapPin },
        { id: 'payments', label: 'Pagamentos', icon: CreditCard },
        { id: 'system', label: 'Sistema', icon: Settings },
    ];

    const InputLabel = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
            {Icon && <Icon size={14} />}
            {children}
        </label>
    );

    const HelperText = ({ children }: { children: React.ReactNode }) => (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{children}</p>
    );

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Settings className="text-slate-400" />
                    {t('settings.title')}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 ml-8">
                    Gerencie todos os parâmetros globais da aplicação em um só lugar.
                </p>
            </div>

            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all flex-1 justify-center
                                ${activeTab === tab.id
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                }
                            `}
                        >
                            <Icon size={16} />
                            <span>{t(`settings.${tab.id}.title`) || tab.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="min-h-[400px]">
                {/* General Section */}
                {activeTab === 'general' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel icon={Building2}>{t('settings.general.name')}</InputLabel>
                                <input
                                    name="system_name"
                                    value={formData.system_name}
                                    onChange={handleChange}
                                    disabled={isSearchingCnpj}
                                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <InputLabel icon={Layout}>{t('settings.general.brand_color')}</InputLabel>
                                <div className="flex gap-2">
                                    <input type="color" name="brand_color" value={formData.brand_color} onChange={handleChange} className="h-10 w-16 p-0.5 rounded-lg cursor-pointer bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700" />
                                    <input name="brand_color" value={formData.brand_color} onChange={handleChange} className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all uppercase" />
                                </div>
                            </div>
                            <div className="col-span-full">
                                <InputLabel icon={Info}>{t('settings.general.description')}</InputLabel>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
                                />
                            </div>

                            {/* Visual Settings */}
                            <div className="col-span-full border-t border-slate-100 dark:border-slate-800 pt-6 mt-2">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                                    <Globe size={16} className="text-slate-400" /> {t('settings.visual.title')}
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel>{t('settings.visual.logo_url')}</InputLabel>
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                                {logoFile ? (
                                                    <img src={URL.createObjectURL(logoFile)} className="w-full h-full object-contain p-2" />
                                                ) : formData.logo_url ? (
                                                    <img src={`${apiUrl.replace('/api', '')}/storage/${formData.logo_url}`} className="w-full h-full object-contain p-2" />
                                                ) : (
                                                    <ImageIcon className="text-slate-300 dark:text-slate-600" size={32} />
                                                )}
                                            </div>
                                            <div className="w-full">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'logo')}
                                                    className="
                                                        block w-full text-xs text-slate-500 dark:text-slate-400 
                                                        file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                                                        file:text-xs file:font-semibold 
                                                        file:bg-slate-100 file:text-slate-700 
                                                        dark:file:bg-slate-800 dark:file:text-slate-300
                                                        hover:file:bg-slate-200 dark:hover:file:bg-slate-700
                                                        cursor-pointer transition-all
                                                    "
                                                />
                                                <HelperText>Formato recomendado: PNG transparente (512x512)</HelperText>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <InputLabel>{t('settings.visual.bg_url')}</InputLabel>
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                                {bgFile ? (
                                                    <img src={URL.createObjectURL(bgFile)} className="w-full h-full object-cover" />
                                                ) : formData.login_bg_url ? (
                                                    <img src={`${apiUrl.replace('/api', '')}/storage/${formData.login_bg_url}`} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="text-slate-300 dark:text-slate-600" size={32} />
                                                )}
                                            </div>
                                            <div className="w-full">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'bg')}
                                                    className="
                                                        block w-full text-xs text-slate-500 dark:text-slate-400 
                                                        file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                                                        file:text-xs file:font-semibold 
                                                        file:bg-slate-100 file:text-slate-700 
                                                        dark:file:bg-slate-800 dark:file:text-slate-300
                                                        hover:file:bg-slate-200 dark:hover:file:bg-slate-700
                                                        cursor-pointer transition-all
                                                    "
                                                />
                                                <HelperText>Formato recomendado: JPG de alta resolução (1920x1080)</HelperText>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <InputLabel>{t('settings.visual.welcome')}</InputLabel>
                                        <input
                                            name="welcome_message"
                                            value={formData.welcome_message || ''}
                                            onChange={handleChange}
                                            className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
                                            placeholder="Ex: Bem-vindo ao sistema de gestão"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Operational Section */}
                {activeTab === 'operational' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                                    <Package size={16} /> Estoque
                                </h3>
                                <div className="flex items-center gap-3 mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="enable_stock_control"
                                            checked={formData.enable_stock_control}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 dark:peer-focus:ring-slate-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-slate-900"></div>
                                    </label>
                                    <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{t('settings.operational.enable_stock')}</span>
                                </div>
                                <InputLabel>{t('settings.operational.min_stock')}</InputLabel>
                                <input
                                    type="number"
                                    name="global_min_stock"
                                    value={formData.global_min_stock}
                                    onChange={handleChange}
                                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all font-mono"
                                />
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                                    <Globe size={16} /> Integrações
                                </h3>
                                <div className="grid gap-4">
                                    <div>
                                        <InputLabel icon={Phone}>{t('settings.operational.whatsapp')}</InputLabel>
                                        <input
                                            name="whatsapp_number"
                                            value={formData.whatsapp_number || ''}
                                            onChange={handleChange}
                                            className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all font-mono"
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-full">
                                <InputLabel icon={Mail}>{t('settings.operational.delivery_msg')}</InputLabel>
                                <textarea
                                    name="delivery_message"
                                    value={formData.delivery_message || ''}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Olá! Seu pedido saiu para entrega..."
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
                                />
                                <HelperText>Mensagem enviada automaticamente ao despachar um pedido (WhatsApp/Email).</HelperText>
                            </div>
                        </div>
                    </div>
                )}

                {/* Fiscal Section */}
                {activeTab === 'fiscal' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel icon={Wallet}>{t('settings.fiscal.cnpj')}</InputLabel>
                                <div className="relative">
                                    <input
                                        name="cnpj"
                                        value={formData.cnpj || ''}
                                        onChange={handleChange}
                                        onBlur={handleBlurCNPJ}
                                        placeholder="00.000.000/0000-00"
                                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all font-mono pl-10"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Building2 size={16} />
                                    </div>
                                    {isSearchingCnpj && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400">
                                            <Loader2 size={16} />
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <InputLabel>{t('settings.fiscal.regime')}</InputLabel>
                                <input name="fiscal_regime" value={formData.fiscal_regime || ''} onChange={handleChange} className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all" />
                            </div>
                            <div>
                                <InputLabel>{t('settings.fiscal.ie')}</InputLabel>
                                <input name="state_registration" value={formData.state_registration || ''} onChange={handleChange} className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all" />
                            </div>
                            <div>
                                <InputLabel>{t('settings.fiscal.im')}</InputLabel>
                                <input name="municipal_registration" value={formData.municipal_registration || ''} onChange={handleChange} className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Address Section */}
                {activeTab === 'address' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <InputLabel icon={MapPin}>{t('settings.address.zip')}</InputLabel>
                                <div className="relative">
                                    <input
                                        name="zip_code"
                                        value={formData.zip_code || ''}
                                        onChange={handleChange}
                                        onBlur={handleBlurCEP}
                                        placeholder="00000-000"
                                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all font-mono pl-10"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <MapPin size={16} />
                                    </div>
                                    {isSearchingCep && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400">
                                            <Loader2 size={16} />
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <InputLabel>{t('settings.address.street')}</InputLabel>
                                <input
                                    name="street"
                                    value={formData.street || ''}
                                    onChange={handleChange}
                                    disabled={isSearchingCep}
                                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <InputLabel>{t('settings.address.number')}</InputLabel>
                                <input name="number" value={formData.number || ''} onChange={handleChange} className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all" />
                            </div>
                            <div>
                                <InputLabel>{t('settings.address.neighborhood')}</InputLabel>
                                <input
                                    name="neighborhood"
                                    value={formData.neighborhood || ''}
                                    onChange={handleChange}
                                    disabled={isSearchingCep}
                                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <InputLabel>{t('settings.address.city')}</InputLabel>
                                <input
                                    name="city"
                                    value={formData.city || ''}
                                    onChange={handleChange}
                                    disabled={isSearchingCep}
                                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <InputLabel>{t('settings.address.state')}</InputLabel>
                                <input
                                    name="state"
                                    value={formData.state || ''}
                                    onChange={handleChange}
                                    disabled={isSearchingCep}
                                    maxLength={2}
                                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all uppercase disabled:opacity-50"
                                />
                            </div>
                            <div className="col-span-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                                    <MapPin size={16} /> Localização Exata
                                </h3>

                                <div className="mb-6">
                                    <LocationMap
                                        lat={formData.latitude ? parseFloat(formData.latitude) : 0}
                                        lng={formData.longitude ? parseFloat(formData.longitude) : 0}
                                        onChange={handleLocationChange}
                                    />
                                    <HelperText>Clique no mapa ou arraste o marcador para definir a localização exata da loja.</HelperText>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <InputLabel icon={MapPin}>{t('settings.address.latitude')}</InputLabel>
                                        <input
                                            name="latitude"
                                            value={formData.latitude || ''}
                                            onChange={handleChange}
                                            placeholder="-23.550520"
                                            className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all font-mono"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel icon={MapPin}>{t('settings.address.longitude')}</InputLabel>
                                        <input
                                            name="longitude"
                                            value={formData.longitude || ''}
                                            onChange={handleChange}
                                            placeholder="-46.633308"
                                            className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* System Section */}
                {activeTab === 'system' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel icon={Clock}>{t('settings.system.refresh_rate')}</InputLabel>
                                <input
                                    type="number"
                                    name="orders_refresh_rate"
                                    value={formData.orders_refresh_rate}
                                    onChange={handleChange}
                                    min="10"
                                    max="3600"
                                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all mb-1"
                                />
                                <HelperText>{t('settings.system.refresh_rate_hint')}</HelperText>

                                <div className="mt-6">
                                    <InputLabel icon={Layout}>{t('settings.system.pagination_limit')}</InputLabel>
                                    <input
                                        type="number"
                                        name="pagination_limit"
                                        value={formData.pagination_limit || ''}
                                        onChange={handleChange}
                                        min="1"
                                        max="100"
                                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all mb-1"
                                    />
                                    <HelperText>Quantidade padrão de itens exibidos por página nas tabelas.</HelperText>
                                </div>

                                <div className="mt-6">
                                    <InputLabel icon={Key}>{t('settings.system.token_expiration')}</InputLabel>
                                    <input
                                        type="number"
                                        name="auth_token_expiration"
                                        value={formData.auth_token_expiration || ''}
                                        onChange={handleChange}
                                        min="5"
                                        max="43200"
                                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all mb-1"
                                    />
                                    <HelperText>{t('settings.system.token_expiration_hint')}</HelperText>
                                </div>
                            </div>
                            <div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 h-full">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                                        <Mail size={16} /> {t('settings.system.email_config')}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {t('settings.system.email_hint')}
                                    </p>
                                    <div className="mt-4 text-xs font-mono bg-slate-100 dark:bg-slate-950 p-3 rounded-lg text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                                        MAIL_MAILER=smtp<br />
                                        MAIL_HOST=smtp.mailtrap.io<br />
                                        MAIL_PORT=2525
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payments Section - Simplified Unified Form */}
                {activeTab === 'payments' && (
                    <UnifiedPaymentForm
                        paymentMethods={paymentMethods}
                        setPaymentMethods={setPaymentMethods}
                        savePaymentSettings={savePaymentSettings}
                        loading={loadingPayments}
                        t={t}
                    />
                )}
            </div>

            {
                activeTab !== 'payments' && (
                    <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="
                        bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 
                        px-6 py-2.5 rounded-lg font-bold text-sm shadow-md 
                        hover:bg-slate-800 dark:hover:bg-slate-200 
                        focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-slate-50
                        transition-all disabled:opacity-50 disabled:cursor-not-allowed 
                        flex items-center gap-2
                    "
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    {t('common.saving')}
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    {t('settings.save_btn')}
                                </>
                            )}
                        </button>
                    </div>
                )
            }
        </form >
    );
}
