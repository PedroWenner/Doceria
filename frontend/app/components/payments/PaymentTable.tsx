import { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { displayCurrency } from '@/app/utils/formatters';
import { Check, X, Clock, CreditCard, Banknote, Search, RefreshCw, Edit } from 'lucide-react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface Payment {
  id: number;
  order_id: number | null;
  external_id: string | null;
  method: string;
  status: string;
  amount: string;
  created_at: string;
  order?: {
    customer_name: string;
  }
}

interface Props {
  payments: Payment[];
  isLoading: boolean;
  token?: string;
  onRefresh?: () => void;
  onEdit?: (payment: Payment) => void;
}

export default function PaymentTable({ payments, isLoading, token, onRefresh, onEdit }: Props) {
  const { t } = useLanguage();
  const [syncingId, setSyncingId] = useState<number | null>(null);

  const handleSync = async (paymentId: number) => {
    if (!token) return;
    setSyncingId(paymentId);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/${paymentId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(t('payments_dashboard.table.sync_success'));
        if (onRefresh) onRefresh();
      } else {
        toast.error(data.message || t('payments_dashboard.table.sync_error'));
      }
    } catch (error) {
      console.error(error);
      toast.error(t('payments_dashboard.table.sync_error'));
    } finally {
      setSyncingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30 uppercase tracking-wide"><Check size={10} /> {t('orders.payment_status.paid')}</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30 uppercase tracking-wide"><X size={10} /> {t('orders.payment_status.failed')}</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 uppercase tracking-wide"><Clock size={10} /> {t('orders.payment_status.pending')}</span>;
    }
  };

  const getMethodIcon = (method: string) => {
    if (method.includes('pix')) return <span className="text-emerald-600 font-bold text-[10px] border border-emerald-200 bg-emerald-50 px-1 rounded">PIX</span>;
    if (method.includes('card') || method.includes('credito')) return <CreditCard size={14} className="text-slate-500" />;
    return <Banknote size={14} className="text-slate-500" />;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <Search size={32} className="opacity-20 text-slate-500" />
          <span className="text-slate-500 text-sm">{t('payments_dashboard.table.no_payments')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('payments_dashboard.table.id')}</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('payments_dashboard.table.order')}</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('payments_dashboard.table.method')}</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('payments_dashboard.table.date')}</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('payments_dashboard.table.value')}</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">{t('payments_dashboard.table.status')}</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12 text-right">{t('payments_dashboard.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs text-slate-500">#{payment.id}</span>
                  {payment.external_id && !payment.external_id.startsWith('MANUAL') && (
                    <div className="text-[10px] text-slate-400 font-mono truncate max-w-[100px] mt-0.5" title={payment.external_id}>
                      {payment.external_id}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {payment.order_id ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                        Pedido #{payment.order_id}
                      </span>
                      <span className="text-xs text-slate-500">{payment.order?.customer_name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">{t('payments_dashboard.table.avulso')}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 capitalize">
                    {getMethodIcon(payment.method)}
                    <span className="text-xs">{payment.method.replace(/_/g, ' ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </span>
                    <span>{new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-medium text-slate-900 dark:text-slate-100 font-mono text-sm tabular-nums">
                    {displayCurrency(payment.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(payment.status)}
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(payment); }}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-primary transition-colors"
                    title={t('common.edit')}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSync(payment.id); }}
                    disabled={(syncingId === payment.id || !token || payment.status === 'paid')}
                    className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors ${syncingId === payment.id ? 'animate-spin text-blue-600' : ''}`}
                    title={t('payments_dashboard.table.sync_tooltip')}
                  >
                    <RefreshCw size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
