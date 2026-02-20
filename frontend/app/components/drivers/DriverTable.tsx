import { Truck, User, MapPin } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

interface Driver {
    id: string;
    name: string;
    type: string;
    status: string;
    latitude?: number;
    longitude?: number;
}

interface DriverTableProps {
    drivers: Driver[];
    isLoading: boolean;
}

export default function DriverTable({ drivers, isLoading }: DriverTableProps) {
    const { t } = useLanguage();

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-brand-choco/30 border-t-brand-choco rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="px-6 py-4">{t('drivers.table.name')}</th>
                            <th className="px-6 py-4">{t('drivers.table.type')}</th>
                            <th className="px-6 py-4">{t('drivers.table.status')}</th>
                            <th className="px-6 py-4">{t('drivers.table.last_location')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {drivers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Truck size={48} className="text-slate-200 dark:text-slate-700" />
                                        <p>{t('drivers.table.no_drivers_found')}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            drivers.map((driver) => (
                                <tr key={driver.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                <User size={16} />
                                            </div>
                                            {driver.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${driver.type === 'OWN_FLEET'
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                            }`}>
                                            {driver.type === 'OWN_FLEET' ? 'Frota Própria' : 'Parceiro'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${driver.status === 'AVAILABLE'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : driver.status === 'BUSY'
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${driver.status === 'AVAILABLE' ? 'bg-emerald-500' :
                                                driver.status === 'BUSY' ? 'bg-amber-500' : 'bg-slate-400'
                                                }`} />
                                            {driver.status === 'AVAILABLE' ? 'Disponível' :
                                                driver.status === 'BUSY' ? 'Em Rota' : 'Offline'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                                        {driver.latitude && driver.longitude ? (
                                            <div className="flex items-center gap-1">
                                                <MapPin size={12} />
                                                {Number(driver.latitude).toFixed(4)}, {Number(driver.longitude).toFixed(4)}
                                            </div>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
