'use client';

import { useLanguage } from '@/app/context/LanguageContext';
import { displayCurrency } from '@/app/utils/formatters';
import { Clock, CheckCircle, XCircle, MoreVertical, CreditCard, Banknote } from 'lucide-react';

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
}

export default function PaymentTable({ payments, isLoading }: Props) {
  const { t } = useLanguage();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide"><CheckCircle size={12} /> Pago</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-wide"><XCircle size={12} /> Falhou</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wide"><Clock size={12} /> Pendente</span>;
    }
  };

  const getMethodIcon = (method: string) => {
    if (method.includes('pix')) return <span className="text-emerald-500">💠</span>;
    if (method.includes('card') || method.includes('credito')) return <CreditCard size={16} className="text-sky-500" />;
    return <Banknote size={16} className="text-slate-500" />;
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
         <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg w-full"></div>
            ))}
         </div>
      </div>
    );
  }

  if (payments.length === 0) {
      return (
        <div className="w-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Banknote size={32} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Nenhum pagamento encontrado</h3>
            <p className="text-slate-500 dark:text-slate-400">Tente ajustar os filtros ou adicione um novo pagamento.</p>
        </div>
      );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">ID</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ref / Pedido</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Método</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Valor</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="py-4 px-6 text-xs font-mono text-slate-400">#{payment.id}</td>
                <td className="py-4 px-6">
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-slate-200 text-sm">
                            {payment.external_id ? (payment.external_id.startsWith('MANUAL') ? 'Manual' : 'Gateway') : 'Manual'}
                        </span>
                        {payment.order_id && (
                            <span className="text-xs text-sky-600 dark:text-sky-400 font-medium cursor-pointer hover:underline">
                                Pedido #{payment.order_id} ({payment.order?.customer_name || 'N/A'})
                            </span>
                        )}
                        {payment.external_id && !payment.external_id.startsWith('MANUAL') && (
                             <span className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]" title={payment.external_id}>{payment.external_id}</span>
                        )}
                    </div>
                </td>
                <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 capitalize">
                        {getMethodIcon(payment.method)}
                        <span>{payment.method.replace(/_/g, ' ')}</span>
                    </div>
                </td>
                <td className="py-4 px-6">
                    <div className="flex flex-col text-xs text-slate-500 dark:text-slate-400">
                         <span className="font-semibold text-slate-700 dark:text-slate-300">
                             {new Date(payment.created_at).toLocaleDateString()}
                         </span>
                         <span>{new Date(payment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                </td>
                <td className="py-4 px-6 text-right">
                    <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {displayCurrency(payment.amount)}
                    </span>
                </td>
                <td className="py-4 px-6 text-center">
                    {getStatusBadge(payment.status)}
                </td>
                <td className="py-4 px-6 text-center">
                    <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                        <MoreVertical size={16} />
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
