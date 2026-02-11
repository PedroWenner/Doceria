
import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { displayCurrency, displayDateTime } from '@/app/utils/formatters';
import { ArrowUpCircle, ArrowDownCircle, Download } from 'lucide-react';

interface Transaction {
    id: number;
    date: string;
    description: string;
    category: string;
    type: 'income' | 'expense';
    amount: number;
    method: string;
    status: string;
}

interface Props {
    data: Transaction[];
    isLoading: boolean;
}

export default function DetailedReportTable({ data, isLoading }: Props) {
    const { t } = useLanguage();

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">{t('common.loading')}</div>;
    }

    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-500">{t('reports.placeholders.no_data') || 'No transactions found.'}</p>
            </div>
        );
    }

    const downloadCSV = () => {
        const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Method', 'Status'];
        const rows = data.map(item => [
            item.date,
            item.description,
            item.category,
            item.type,
            item.amount,
            item.method,
            item.status
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(','), ...rows.map(e => e.join(','))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "financial_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {t('reports.transactions')}
                </h3>
                <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <Download size={16} />
                    {t('reports.actions.export_csv')}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                        <tr>
                            <th className="px-6 py-4">{t('reports.table.date')}</th>
                            <th className="px-6 py-4">{t('reports.table.description')}</th>
                            <th className="px-6 py-4">{t('reports.table.category')}</th>
                            <th className="px-6 py-4">{t('reports.table.method')}</th>
                            <th className="px-6 py-4 text-right">{t('reports.table.amount')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                        {data.map((item, index) => (
                            <tr key={`${item.type}-${item.id}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {displayDateTime(item.date)}
                                </td>
                                <td className="px-6 py-4 font-medium">
                                    {item.description}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {item.method}
                                </td>
                                <td className={`px-6 py-4 text-right font-bold ${item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    <div className="flex items-center justify-end gap-1">
                                        {item.type === 'income' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                                        {item.type === 'expense' ? '-' : '+'} {displayCurrency(item.amount)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
