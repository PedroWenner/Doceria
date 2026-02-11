import { useState, useEffect } from 'react';
import { X, Check, Upload, FileText, Trash2, AlertTriangle, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/app/context/LanguageContext';
import { formatCurrency, parseCurrency } from '@/app/utils/formatters';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    token: string | undefined;
    payment?: any | null;
}

export default function NewPaymentModal({ isOpen, onClose, onSuccess, token, payment }: Props) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        method: 'cash',
        status: 'paid',
        order_id: '',
        notes: ''
    });

    const [files, setFiles] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
    const [removedAttachmentIds, setRemovedAttachmentIds] = useState<number[]>([]);

    useEffect(() => {
        if (payment) {
            setFormData({
                amount: formatCurrency(payment.amount),
                method: payment.method,
                status: payment.status,
                order_id: payment.order_id ? payment.order_id.toString() : '',
                notes: payment.metadata?.notes || payment.metadata?.description || '' // Handle varied metadata structure
            });
            setExistingAttachments(payment.attachments || []);
        } else {
            setFormData({ amount: '', method: 'cash', status: 'paid', order_id: '', notes: '' });
            setExistingAttachments([]);
        }
        setFiles([]);
        setRemovedAttachmentIds([]);
    }, [payment, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setLoading(true);

        const url = payment
            ? `${process.env.NEXT_PUBLIC_API_URL}/payments/${payment.id}`
            : `${process.env.NEXT_PUBLIC_API_URL}/payments`;

        const submitData = new FormData();

        // Only send core fields if allowed (not linked to order) OR if it's a new payment
        const isLinked = payment?.order_id;

        if (!isLinked) {
            submitData.append('amount', parseCurrency(formData.amount).toString());
            submitData.append('method', formData.method);
            submitData.append('status', formData.status);
            if (formData.order_id) submitData.append('order_id', formData.order_id);
        } else {
            // Even if linked, backend might ignore, but let's send minimal data or just not append them.
            // Actually PaymentController update method filters what it accepts.
            // But let's send them if we want to support editing allow-listed fields.
            // For now, core fields are disabled in UI for linked payments.
        }

        submitData.append('notes', formData.notes);

        files.forEach(file => {
            submitData.append('documents[]', file);
        });

        // Handle removed attachments
        if (payment && removedAttachmentIds.length > 0) {
            for (const id of removedAttachmentIds) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/attachments/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        }

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: submitData
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(t('payments_dashboard.modal.success'));
                onSuccess();
                onClose();
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
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                        {payment ? t('payments_dashboard.modal.edit_title') : t('payments_dashboard.modal.title')}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 bg-white dark:bg-slate-950 flex-1 overflow-y-auto">
                    <form id="paymentForm" onSubmit={handleSubmit} className="space-y-5">

                        {/* Amount */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 flex justify-between">
                                <span>{t('payments_dashboard.modal.amount')} (R$)</span>
                                {payment?.order_id && <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"><Lock size={8} /> Vinculado ao Pedido</span>}
                            </label>
                            <input
                                type="text"
                                required
                                disabled={!!payment?.order_id}
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: formatCurrency(e.target.value) })}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 font-bold text-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none transition-all placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="R$ 0,00"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            {/* Method */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('payments_dashboard.modal.method')}</label>
                                <select
                                    disabled={!!payment?.order_id}
                                    value={formData.method}
                                    onChange={e => setFormData({ ...formData, method: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    disabled={!!payment?.order_id}
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                                disabled={!!payment}
                                value={formData.order_id}
                                onChange={e => setFormData({ ...formData, order_id: e.target.value })}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="Ex: 105"
                            />
                            {!payment && <p className="text-[10px] text-slate-400 mt-1">Opcional. Se informado e pago, atualizará o status do pedido.</p>}
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
                        {/* Attachments */}
                        <div className="md:col-span-2 space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t('financial.attachments')}</label>

                            {/* File Input */}
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-6 h-6 mb-2 text-slate-400" />
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            <span className="font-semibold">{t('financial.click_upload')}</span>
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        multiple
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                setFiles([...files, ...Array.from(e.target.files)]);
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            {/* Selected Files List */}
                            {(files.length > 0 || existingAttachments.length > 0) && (
                                <div className="space-y-2">
                                    {files.map((file, index) => (
                                        <div key={`new-${index}`} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <FileText size={16} className="text-blue-500" />
                                                <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{file.name}</span>
                                            </div>
                                            <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== index))} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
                                        </div>
                                    ))}
                                    {existingAttachments.map((att) => (
                                        <div key={att.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <FileText size={16} className="text-slate-500" />
                                                <a href={`${process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage'}/${att.file_path}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate max-w-[200px]">{att.original_name}</a>
                                            </div>
                                            <button type="button" onClick={() => {
                                                setRemovedAttachmentIds([...removedAttachmentIds, att.id]);
                                                setExistingAttachments(existingAttachments.filter(item => item.id !== att.id));
                                            }} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
