'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface ForgotPasswordForm {
    email: string;
}

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();

    const onSubmit = async (data: ForgotPasswordForm) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.email || 'Erro ao enviar e-mail.');
            }

            setIsSent(true);
            toast.success('Link de recuperação enviado!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao enviar o link. Verifique o e-mail informado.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <Link href="/" className="text-3xl font-serif font-bold text-[var(--brand-choco)] tracking-wide hover:opacity-80 transition-opacity">
                        SweetStore
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold tracking-tight text-[var(--foreground)]">
                        Recuperar Senha
                    </h2>
                    <p className="mt-2 text-sm text-[var(--store-text-muted)]">
                        Informe seu e-mail para receber o link de redefinição.
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[var(--store-card)] py-8 px-4 shadow-xl ring-1 ring-[var(--store-ring)] sm:rounded-xl sm:px-10 backdrop-blur-sm bg-opacity-95">
                    {isSent ? (
                        <div className="text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <Mail className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-[var(--store-text)]">E-mail Enviado!</h3>
                            <p className="mt-2 text-sm text-[var(--store-text-muted)]">
                                Verifique sua caixa de entrada (e spam) para redefinir sua senha.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/signin"
                                    className="text-sm font-medium text-[var(--brand-gold)] hover:text-[var(--brand-choco)] transition-colors"
                                >
                                    Voltar para Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-[var(--store-text)]">
                                    E-mail
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        className={`block w-full pl-10 appearance-none rounded-lg border ${errors.email ? 'border-red-300' : 'border-[var(--store-border)]'} px-3 py-2 text-[var(--store-text)] placeholder-gray-400 shadow-sm focus:border-[var(--brand-gold)] focus:outline-none focus:ring-[var(--brand-gold)] sm:text-sm bg-[var(--store-bg)]`}
                                        placeholder="seu@email.com"
                                        {...register('email', { required: 'E-mail é obrigatório' })}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex w-full justify-center rounded-lg border border-transparent bg-[var(--store-primary)] py-2.5 px-4 text-sm font-medium text-[var(--store-primary-fg)] shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        'Enviar Link'
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center justify-center">
                                <Link
                                    href="/signin"
                                    className="flex items-center text-sm font-medium text-[var(--store-text-muted)] hover:text-[var(--brand-choco)] transition-colors"
                                >
                                    <ArrowLeft className="mr-1 h-4 w-4" />
                                    Voltar para Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
