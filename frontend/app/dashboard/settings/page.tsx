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

                {/* Payments Section - Pro Grid Layout */}
                {activeTab === 'payments' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Métodos de Pagamento</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie as credenciais e status dos gateways de pagamento.</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50 flex items-center gap-1.5 font-medium">
                                    <Info size={12} />
                                    Ambiente Seguro (SSL)
                                </span>
                            </div>
                        </div>

                        {loadingPayments ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                ))}
                            </div>
                        ) : paymentMethods.length === 0 ? (
                            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Nenhum meio disponível</h3>
                                <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Parece que os seeders de banco de dados não foram executados ou não há plugins de pagamento instalados.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {paymentMethods.map((method) => {
                                    const settings = method.gateway_setting || {
                                        mode: 'sandbox',
                                        is_active: false,
                                        credentials: {}
                                    };
                                    const credentials = settings.credentials || {};
                                    const isPix = method.slug.includes('pix');
                                    const isCard = method.slug.includes('card') || method.slug.includes('credit');

                                    return (
                                        <div
                                            key={method.id}
                                            className={`
                                            group relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl p-6 transition-all duration-300
                                            border-2 ${settings.is_active ? 'border-indigo-500/10 dark:border-indigo-500/20 shadow-lg shadow-indigo-500/5' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}
                                        `}
                                        >
                                            <div className="flex items-start justify-between mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className={`
                                                    p-3.5 rounded-2xl transition-colors duration-300
                                                    ${settings.is_active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}
                                                `}>
                                                        {isPix ? <Building2 size={24} /> : <CreditCard size={24} />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50 leading-tight">{method.name}</h3>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${settings.mode === 'production'
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900'
                                                                : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900'
                                                                }`}>
                                                                {settings.mode === 'production' ? 'PROD' : 'SANDBOX'}
                                                            </span>
                                                            <span className="text-xs text-slate-400 font-mono">{method.slug}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="relative inline-flex items-center cursor-pointer group/toggle">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={settings.is_active}
                                                        onChange={(e) => handlePaymentSettingChange(method.id, 'is_active', e.target.checked)}
                                                    />
                                                    <div className={`
                                                    w-12 h-7 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 
                                                    bg-slate-200 dark:bg-slate-700 peer-checked:bg-indigo-600 transition-all duration-300
                                                    after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white 
                                                    after:rounded-full after:h-5.5 after:w-5.5 after:shadow-sm after:transition-all after:duration-300
                                                    peer-checked:after:translate-x-full
                                                `}></div>
                                                </div>
                                            </div>

                                            <div className="space-y-5">
                                                {/* Environment Selector */}
                                                <div className="bg-slate-50 dark:bg-slate-950/50 p-1.5 rounded-lg inline-flex w-full border border-slate-100 dark:border-slate-800">
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePaymentSettingChange(method.id, 'mode', 'sandbox')}
                                                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${settings.mode === 'sandbox'
                                                            ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        Sandbox (Teste)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePaymentSettingChange(method.id, 'mode', 'production')}
                                                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${settings.mode === 'production'
                                                            ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        Produção (Real)
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    {isPix ? (
                                                        <>
                                                            <div className="space-y-1.5">
                                                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-1">Chave Pix</label>
                                                                <div className="relative group/input">
                                                                    <Key className="absolute left-3 top-2.5 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" size={16} />
                                                                    <input
                                                                        type="text"
                                                                        value={credentials.pix_key || ''}
                                                                        onChange={(e) => handlePaymentSettingChange(method.id, 'pix_key', e.target.value)}
                                                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-mono text-slate-700 dark:text-slate-300"
                                                                        placeholder="CPF, CNPJ, Email..."
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-1">Beneficiário</label>
                                                                <div className="relative group/input">
                                                                    <UserCircle className="absolute left-3 top-2.5 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" size={16} />
                                                                    <input
                                                                        type="text"
                                                                        value={credentials.payee_name || ''}
                                                                        onChange={(e) => handlePaymentSettingChange(method.id, 'payee_name', e.target.value)}
                                                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-700 dark:text-slate-300"
                                                                        placeholder="Nome completo..."
                                                                    />
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : isCard ? (
                                                        <>
                                                            <div className="space-y-1.5">
                                                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-1">API Key (Public)</label>
                                                                <div className="relative group/input">
                                                                    <Globe className="absolute left-3 top-2.5 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" size={16} />
                                                                    <input
                                                                        type="text"
                                                                        value={credentials.public_key || ''}
                                                                        onChange={(e) => handlePaymentSettingChange(method.id, 'public_key', e.target.value)}
                                                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-mono text-slate-700 dark:text-slate-300"
                                                                        placeholder="pk_test_..."
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-1">Secret Key</label>
                                                                <div className="relative group/input">
                                                                    <Key className="absolute left-3 top-2.5 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" size={16} />
                                                                    <input
                                                                        type="password"
                                                                        value={credentials.secret_key || ''}
                                                                        onChange={(e) => handlePaymentSettingChange(method.id, 'secret_key', e.target.value)}
                                                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-mono text-slate-700 dark:text-slate-300"
                                                                        placeholder="sk_test_..."
                                                                    />
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center">
                                                            <span className="text-sm text-slate-500 italic">Configurações adicionais gerenciadas externamente.</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => savePaymentSettings(method.id)}
                                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-lg font-bold text-sm hover:translate-y-[-1px] active:translate-y-[0px] shadow-lg hover:shadow-xl transition-all duration-200"
                                                >
                                                    <Save size={16} />
                                                    Salvar Alterações
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
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
