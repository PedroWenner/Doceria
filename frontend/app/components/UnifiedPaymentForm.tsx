import React from 'react';
import { CreditCard, Key, Save, Info } from 'lucide-react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface UnifiedPaymentFormProps {
    paymentMethods: any[];
    setPaymentMethods: React.Dispatch<React.SetStateAction<any[]>>;
    savePaymentSettings: (id: number) => Promise<void>;
    loading: boolean;
    t: (key: string) => string;
}

export default function UnifiedPaymentForm({ paymentMethods, setPaymentMethods, savePaymentSettings, loading, t }: UnifiedPaymentFormProps) {
    const InputLabel = ({ children }: { children: React.ReactNode }) => (
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
            {children}
        </label>
    );

    // Helper to update all relevant methods
    const updateAllMethods = (updater: (method: any) => any) => {
        setPaymentMethods(prev => prev.map(m => {
            if (['pix', 'carto_de_credito', 'boleto'].includes(m.slug)) {
                return updater(m);
            }
            return m;
        }));
    };

    // Get current state from one representative (e.g. Card)
    const cardMethod = paymentMethods.find(m => m.slug === 'carto_de_credito');
    const isActive = cardMethod?.gateway_setting?.is_active ?? false;
    const mode = cardMethod?.gateway_setting?.mode || 'sandbox';
    const credentials = cardMethod?.gateway_setting?.credentials || {};

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <CreditCard size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('settings.payments.mercado_pago_title')}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.payments.mercado_pago_desc')}</p>
                </div>
            </div>

            {loading ? (
                <div className="py-12 flex justify-center"><LoadingSpinner /></div>
            ) : (
                <div className="space-y-6">
                    {/* Active Toggle */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="col-span-full">
                            <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => updateAllMethods(m => ({
                                        ...m,
                                        gateway_setting: { ...m.gateway_setting, is_active: e.target.checked }
                                    }))}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                />
                                <div>
                                    <span className="block font-medium text-slate-900 dark:text-slate-100">{t('settings.payments.enable_integration')}</span>
                                    <span className="block text-xs text-slate-500">{t('settings.payments.enable_hint')}</span>
                                </div>
                            </label>
                        </div>

                        {/* Mode Switcher */}
                        <div>
                            <InputLabel>{t('settings.payments.mode')}</InputLabel>
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                {['sandbox', 'production'].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => updateAllMethods(method => ({
                                            ...method,
                                            gateway_setting: { ...method.gateway_setting, mode: m }
                                        }))}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize ${mode === m
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-full h-px bg-slate-100 dark:bg-slate-800 my-2" />

                        {/* Credentials */}
                        <div className="col-span-full">
                            <InputLabel>{t('settings.payments.access_token')} ({mode})</InputLabel>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={credentials.access_token || ''}
                                    onChange={(e) => updateAllMethods(m => ({
                                        ...m,
                                        gateway_setting: {
                                            ...m.gateway_setting,
                                            credentials: { ...m.gateway_setting?.credentials, access_token: e.target.value }
                                        }
                                    }))}
                                    className="w-full h-10 px-3 pl-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all font-mono"
                                    placeholder="TEST-..."
                                />
                                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

                        <div>
                            <InputLabel>{t('settings.payments.client_id')}</InputLabel>
                            <input
                                value={credentials.client_id || ''}
                                onChange={(e) => updateAllMethods(m => ({
                                    ...m,
                                    gateway_setting: {
                                        ...m.gateway_setting,
                                        credentials: { ...m.gateway_setting?.credentials, client_id: e.target.value }
                                    }
                                }))}
                                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
                            />
                        </div>

                        <div>
                            <InputLabel>{t('settings.payments.client_secret')}</InputLabel>
                            <input
                                type="password"
                                value={credentials.client_secret || ''}
                                onChange={(e) => updateAllMethods(m => ({
                                    ...m,
                                    gateway_setting: {
                                        ...m.gateway_setting,
                                        credentials: { ...m.gateway_setting?.credentials, client_secret: e.target.value }
                                    }
                                }))}
                                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <InputLabel>{t('settings.payments.public_key')}</InputLabel>
                            <input
                                value={credentials.public_key || ''}
                                onChange={(e) => updateAllMethods(m => ({
                                    ...m,
                                    gateway_setting: {
                                        ...m.gateway_setting,
                                        credentials: { ...m.gateway_setting?.credentials, public_key: e.target.value }
                                    }
                                }))}
                                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={async () => {
                                // Save ALL relevant methods
                                const promises = paymentMethods
                                    .filter(m => ['pix', 'carto_de_credito', 'boleto'].includes(m.slug))
                                    .map(m => savePaymentSettings(m.id));

                                await Promise.all(promises);
                            }}
                            className="bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm flex items-center gap-2"
                        >
                            <Save size={18} />
                            {t('common.save')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
