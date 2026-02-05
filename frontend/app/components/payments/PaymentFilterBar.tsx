'use client';

import { Search, Filter, Calendar, Plus } from 'lucide-react';
import { useState } from 'react';

interface Props {
    onSearch: (value: string) => void;
    onStatusChange: (status: string) => void;
    onMethodChange: (method: string) => void;
    onDateChange: (start: string, end: string) => void;
    onNewPayment: () => void;
}

export default function PaymentFilterBar({ onSearch, onStatusChange, onMethodChange, onDateChange, onNewPayment }: Props) {
    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between mb-6">

            {/* Search Input */}
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar ID, Pedido..."
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all placeholder:text-slate-400"
                />
            </div>

            {/* Filters Group */}
            <div className="flex flex-1 gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <select
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500/50 cursor-pointer"
                >
                    <option value="all">Todos Status</option>
                    <option value="paid">✅ Pagos</option>
                    <option value="pending">⏳ Pendentes</option>
                    <option value="failed">❌ Falhas</option>
                </select>

                <select
                    onChange={(e) => onMethodChange(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500/50 cursor-pointer"
                >
                    <option value="all">Todos Métodos</option>
                    <option value="pix">💠 Pix</option>
                    <option value="credit_card">💳 Cartão de Crédito</option>
                    <option value="cash">💵 Dinheiro</option>
                </select>

                {/* Date Picker Stub (Simplificado para hoje) */}
                <button className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                    <Calendar size={16} />
                    <span className="hidden sm:inline">Data</span>
                </button>
            </div>

            {/* Action Button */}
            <button
                onClick={onNewPayment}
                className="w-full md:w-auto px-5 py-2.5 bg-slate-900 dark:bg-pink-600 text-white rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-pink-700 transition-all shadow-lg shadow-slate-900/10 dark:shadow-pink-900/20 flex items-center justify-center gap-2 active:scale-95"
            >
                <Plus size={18} />
                <span>Novo Pagamento</span>
            </button>
        </div>
    );
}
