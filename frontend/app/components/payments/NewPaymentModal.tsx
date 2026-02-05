'use client';

import { useState } from 'react';
import { X, Check, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    token: string | undefined;
}

export default function NewPaymentModal({ isOpen, onClose, onSuccess, token }: Props) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        method: 'cash',
        status: 'paid', // Default to paid for manual entries usually
        order_id: '',
        notes: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: parseFloat(formData.amount),
                    method: formData.method,
                    status: formData.status,
                    order_id: formData.order_id ? parseInt(formData.order_id) : null,
                    notes: formData.notes
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Pagamento registrado com sucesso!');
                onSuccess();
                onClose();
            } else {
                toast.error(data.message || 'Erro ao registrar pagamento');
            }

        } catch (error) {
            toast.error('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600">
                            <DollarSign size={18} />
                        </div>
                        Novo Pagamento Manual
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Valor (R$)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-400 font-bold">R$</span>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-lg font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pink-500/50 outline-none"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Method */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Método</label>
                            <select
                                value={formData.method}
                                onChange={e => setFormData({ ...formData, method: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-pink-500/50 outline-none"
                            >
                                <option value="cash">💵 Dinheiro</option>
                                <option value="pix">💠 Pix Manual</option>
                                <option value="credit_card">💳 Cartão (Máquininha)</option>
                                <option value="debit_card">💳 Débito (Máquininha)</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-pink-500/50 outline-none"
                            >
                                <option value="paid">✅ Pago</option>
                                <option value="pending">⏳ Pendente</option>
                            </select>
                        </div>
                    </div>

                    {/* Order ID Link */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Vincular Pedido (ID) <span className="text-slate-400 font-normal lowercase">(opcional)</span></label>
                        <input
                            type="number"
                            value={formData.order_id}
                            onChange={e => setFormData({ ...formData, order_id: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-pink-500/50 outline-none"
                            placeholder="Ex: 105"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Observações</label>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/50 outline-none min-h-[80px]"
                            placeholder="Ex: Cliente pagou diferença no caixa..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-all shadow-lg shadow-pink-600/20 active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Check size={18} />
                                    Salvar Pagamento
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
