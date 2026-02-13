'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ResetPasswordForm {
    password: string;
    password_confirmation: string;
}

function ResetPasswordBox() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordForm>();
    const password = watch('password');

    useEffect(() => {
        if (!token || !email) {
            toast.error('Link inválido ou expirado.');
            // router.push('/auth/forgot-password'); 
        }
    }, [token, email, router]);

    const onSubmit = async (data: ResetPasswordForm) => {
        if (!token || !email) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    email,
                    password: data.password,
                    password_confirmation: data.password_confirmation,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.email || 'Erro ao redefinir senha.');
            }

            setIsSuccess(true);
            toast.success('Senha redefinida com sucesso!');

            setTimeout(() => {
                router.push('/auth/signin');
            }, 3000);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao redefinir a senha. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-[var(--store-text)]">Senha Atualizada!</h3>
                <p className="mt-2 text-sm text-[var(--store-text-muted)]">
                    Sua senha foi alterada com sucesso. Você será redirecionado para o login em instantes.
                </p>
                <div className="mt-6">
                    <Link
                        href="/auth/signin"
                        className="text-sm font-medium text-[var(--brand-gold)] hover:text-[var(--brand-choco)] transition-colors"
                    >
                        Fazer Login agora
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--store-text)]">
                    Nova Senha
                </label>
                <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className={`block w-full pl-10 pr-10 appearance-none rounded-lg border ${errors.password ? 'border-red-300' : 'border-[var(--store-border)]'} px-3 py-2 text-[var(--store-text)] placeholder-gray-400 shadow-sm focus:border-[var(--brand-gold)] focus:outline-none focus:ring-[var(--brand-gold)] sm:text-sm bg-[var(--store-bg)]`}
                        placeholder="••••••••"
                        {...register('password', {
                            required: 'Senha é obrigatória',
                            minLength: { value: 8, message: 'Mínimo de 8 caracteres' }
                        })}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </div>
                </div>
                {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-[var(--store-text)]">
                    Confirmar Nova Senha
                </label>
                <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="password_confirmation"
                        type={showPassword ? "text" : "password"}
                        className={`block w-full pl-10 appearance-none rounded-lg border ${errors.password_confirmation ? 'border-red-300' : 'border-[var(--store-border)]'} px-3 py-2 text-[var(--store-text)] placeholder-gray-400 shadow-sm focus:border-[var(--brand-gold)] focus:outline-none focus:ring-[var(--brand-gold)] sm:text-sm bg-[var(--store-bg)]`}
                        placeholder="••••••••"
                        {...register('password_confirmation', {
                            required: 'Confirmação é obrigatória',
                            validate: val => val === password || 'As senhas não coincidem'
                        })}
                    />
                </div>
                {errors.password_confirmation && (
                    <p className="mt-1 text-xs text-red-500">{errors.password_confirmation.message}</p>
                )}
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isLoading || !token}
                    className="flex w-full justify-center rounded-lg border border-transparent bg-[var(--store-primary)] py-2.5 px-4 text-sm font-medium text-[var(--store-primary-fg)] shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        'Redefinir Senha'
                    )}
                </button>
            </div>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <Link href="/" className="text-3xl font-serif font-bold text-[var(--brand-choco)] tracking-wide hover:opacity-80 transition-opacity">
                        SweetStore
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold tracking-tight text-[var(--foreground)]">
                        Redefinir Senha
                    </h2>
                    <p className="mt-2 text-sm text-[var(--store-text-muted)]">
                        Crie uma nova senha segura para sua conta.
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[var(--store-card)] py-8 px-4 shadow-xl ring-1 ring-[var(--store-ring)] sm:rounded-xl sm:px-10 backdrop-blur-sm bg-opacity-95">
                    <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin" /></div>}>
                        <ResetPasswordBox />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
