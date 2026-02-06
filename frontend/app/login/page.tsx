'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAdminAuth, AdminAuthProvider } from '@/app/context/AdminAuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Check } from 'lucide-react';
import ThemeToggle from '@/app/components/ThemeToggle';
import LanguageToggle from '@/app/components/LanguageToggle';

function LoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAdminAuth();

    const { t } = useLanguage();

    useEffect(() => {
        const savedEmail = localStorage.getItem('sweetstore_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) throw new Error(t('auth.login_failed'));

            const response = await res.json();
            const userRole = response.data.user.role;

            if (userRole === 'customer') {
                throw new Error('Acesso restrito a administradores e gerentes.');
            }

            if (rememberMe) {
                localStorage.setItem('sweetstore_email', email);
            } else {
                localStorage.removeItem('sweetstore_email');
            }

            login(response.data.access_token, response.data.user);

        } catch (err: any) {
            const msg = err.message || t('auth.invalid_credentials');
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex animate-in fade-in duration-700">
            <Toaster position="top-center" />

            <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-choco via-slate-900 to-brand-gold/10"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/noise.svg')] opacity-20 mix-blend-overlay"></div>

                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-pink/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-gold/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>

                <div className="relative z-10 max-w-lg">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
                        <div className="mb-6">
                            <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
                                <img
                                    src="/alcatech_logo.png"
                                    alt="AlcaTech Logo"
                                    className="h-40 w-auto max-w-full object-contain mx-auto drop-shadow-xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-background relative">

                <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
                    <LanguageToggle />
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-md space-y-8 relative z-10">

                    <div className="text-center space-y-2">
                        <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
                            <img
                                src="/alcatech_brand.png"
                                alt="AlcaTech Logo"
                                className="h-40 w-auto max-w-full object-contain mx-auto drop-shadow-xl"
                            />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            {t('auth.login_title')}
                        </h2>
                        <p className="text-muted-foreground">
                            {t('auth.login_subtitle')}
                        </p>
                    </div>

                    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-slate-900/50">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground ml-1">
                                    {t('auth.email')}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-brand-gold transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-background border border-slate-200 dark:border-slate-700 rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all outline-none"
                                        placeholder="admin@sweetstore.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-foreground ml-1">
                                        {t('auth.password')}
                                    </label>
                                    <a href="#" className="text-xs font-semibold text-brand-choco dark:text-brand-pink hover:text-brand-gold transition-colors">
                                        {t('auth.forgot_password')}
                                    </a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-brand-gold transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-11 pr-11 py-3.5 bg-background border border-slate-200 dark:border-slate-700 rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 dark:border-slate-600 checked:bg-brand-gold checked:border-brand-gold transition-all"
                                    />
                                    <Check size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                </div>
                                <label htmlFor="remember" className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
                                    {t('auth.remember_me')}
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative py-3.5 px-4 rounded-xl shadow-lg shadow-brand-choco/20 dark:shadow-none text-sm font-bold text-white bg-gradient-to-r from-brand-choco to-slate-900 hover:from-slate-800 hover:to-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-choco transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>{t('common.loading')}</span>
                                    </div>
                                ) : (
                                    t('auth.sign_in')
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} AlcaTech. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <AdminAuthProvider>
            <LoginContent />
        </AdminAuthProvider>
    );
}
