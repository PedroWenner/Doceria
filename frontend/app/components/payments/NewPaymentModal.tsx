import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/app/context/LanguageContext';
import { formatCurrency, parseCurrency } from '@/app/utils/formatters';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    token: string | undefined;
}

export default function NewPaymentModal({ isOpen, onClose, onSuccess, token }: Props) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        method: 'cash',
        status: 'paid',
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
                    amount: parseFloat(parseCurrency(formData.amount)),
                    method: formData.method,
                    status: formData.status,
                    order_id: formData.order_id ? parseInt(formData.order_id) : null,
                    notes: formData.notes
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(t('payments_dashboard.modal.success'));
                onSuccess();
                onClose();
                setFormData({ amount: '', method: 'cash', status: 'paid', order_id: '', notes: '' });
            } else {
                toast.error(data.message || t('payments_dashboard.modal.error'));
            }

        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="w-full max-w-lg bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-scaleIn">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t('payments_dashboard.modal.title')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 bg-white dark:bg-slate-950 flex-1 overflow-y-auto">
                    <form id="paymentForm" onSubmit={handleSubmit} className="space-y-5">

                        {/* Amount */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('payments_dashboard.modal.amount')} (R$)</label>
                            <input
                                type="text"
                                required
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: formatCurrency(e.target.value) })}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 font-bold text-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none transition-all placeholder:text-slate-400"
                                placeholder="R$ 0,00"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            {/* Method */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('payments_dashboard.modal.method')}</label>
                                <select
                                    value={formData.method}
                                    onChange={e => setFormData({ ...formData, method: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none cursor-pointer"
                                >
                                    <option value="cash">{t('orders.payment.cash')}</option>
                                    <option value="pix">Pix Manual</option>
                                    <option value="credit_card">{t('orders.payment.credit_card')}</option>
                                    <option value="debit_card">{t('orders.payment.debit_card')}</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('payments_dashboard.modal.status')}</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none cursor-pointer"
                                >
                                    <option value="paid">{t('orders.payment_status.paid')}</option>
                                    <option value="pending">{t('orders.payment_status.pending')}</option>
                                </select>
                            </div>
                        </div>

                        {/* Order ID Link */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('payments_dashboard.table.order')} (ID)</label>
                            <input
                                type="number"
                                value={formData.order_id}
                                onChange={e => setFormData({ ...formData, order_id: e.target.value })}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none font-mono text-sm"
                                placeholder="Ex: 105"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Opcional. Se informado e pago, atualizará o status do pedido.</p>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('payments_dashboard.modal.notes')}</label>
                            <textarea
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none resize-none min-h-[80px]"
                                placeholder="Detalhes adicionais..."
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        {t('payments_dashboard.modal.cancel')}
                    </button>
                    <button
                        form="paymentForm"
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm disabled:opacity-70 disabled:cursor-wait flex items-center gap-2"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={18} /> {t('payments_dashboard.modal.save')}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
