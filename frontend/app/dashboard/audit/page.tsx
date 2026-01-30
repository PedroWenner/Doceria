'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import Cookies from 'js-cookie';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
    ShieldAlert, 
    Search, 
    Filter, 
    Calendar, 
    User, 
    Eye, 
    ChevronDown, 
    ChevronUp,
    PlusCircle,
    Edit3,
    Trash2,
    RotateCcw,
    FileJson,
    ArrowRight
} from 'lucide-react';

interface Audit {
    id: number;
    user_type: string | null;
    user_id: number | null;
    event: string;
    auditable_type: string;
    auditable_id: number;
    old_values: any;
    new_values: any;
    url: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

interface User {
    id: number;
    name: string;
}

export default function AuditPage() {
    const [audits, setAudits] = useState<Audit[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedAudit, setExpandedAudit] = useState<number | null>(null);

    // Filters
    const [filterUser, setFilterUser] = useState('');
    const [filterEvent, setFilterEvent] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const { t } = useLanguage();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = Cookies.get('admin_token');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchAudits();
    }, [filterUser, filterEvent, dateFrom, dateTo]);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${apiUrl}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const response = await res.json();
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const fetchAudits = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterUser) params.append('user_id', filterUser);
            if (filterEvent) params.append('event', filterEvent);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);

            const res = await fetch(`${apiUrl}/audits?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const response = await res.json();
                setAudits(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch audits', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString([], { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getEventBadge = (event: string) => {
        const config: Record<string, { color: string, icon: any }> = {
            created: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30', icon: PlusCircle },
            updated: { color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30', icon: Edit3 },
            deleted: { color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30', icon: Trash2 },
            restored: { color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30', icon: RotateCcw }
        };

        const style = config[event] || { color: 'bg-slate-50 text-slate-700 border-slate-200', icon: FileJson };
        const Icon = style.icon;
        const label = t(`audit.${event}`) || event;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${style.color}`}>
                <Icon size={12} />
                <span className="capitalize">{label}</span>
            </span>
        );
    };

    const renderChanges = (audit: Audit) => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-rose-50/50 dark:bg-rose-900/10 rounded-lg p-3 border border-rose-100 dark:border-rose-900/20">
                    <div className="flex items-center gap-2 mb-2 text-rose-700 dark:text-rose-400 font-semibold text-xs uppercase tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        {t('audit.old_values')}
                    </div>
                    {audit.old_values ? (
                        <pre className="font-mono text-xs text-rose-800 dark:text-rose-300 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(audit.old_values, null, 2)}
                        </pre>
                    ) : (
                        <span className="text-xs text-slate-400 italic">No previous data</span>
                    )}
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg p-3 border border-emerald-100 dark:border-emerald-900/20">
                    <div className="flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {t('audit.new_values')}
                    </div>
                    {audit.new_values ? (
                        <pre className="font-mono text-xs text-emerald-800 dark:text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(audit.new_values, null, 2)}
                        </pre>
                    ) : (
                        <span className="text-xs text-slate-400 italic">No new data</span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <ShieldAlert className="text-slate-400" />
                    {t('audit.title')}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 ml-8">
                    Rastreamento completo de atividades e segurança do sistema.
                </p>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* User Filter */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <User size={12} /> {t('audit.filter_user')}
                        </label>
                        <select
                            className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
                            value={filterUser}
                            onChange={e => setFilterUser(e.target.value)}
                        >
                            <option value="">Todos os usuários</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>

                    {/* Event Filter */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Filter size={12} /> {t('audit.filter_event')}
                        </label>
                        <select
                            className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all capitalize"
                            value={filterEvent}
                            onChange={e => setFilterEvent(e.target.value)}
                        >
                            <option value="">Todos os eventos</option>
                            <option value="created">{t('audit.created')}</option>
                            <option value="updated">{t('audit.updated')}</option>
                            <option value="deleted">{t('audit.deleted')}</option>
                            <option value="restored">{t('audit.restored')}</option>
                        </select>
                    </div>

                    {/* Date From */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Calendar size={12} /> Data Inicial
                        </label>
                        <input
                            type="date"
                            className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                        />
                    </div>

                    {/* Date To */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Calendar size={12} /> Data Final
                        </label>
                        <input
                            type="date"
                            className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('audit.date')}</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('audit.user')}</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('audit.event')}</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('audit.auditable')}</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-12">
                                        <div className="flex justify-center"><LoadingSpinner /></div>
                                    </td>
                                </tr>
                            ) : audits.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search size={32} className="opacity-20" />
                                            <span>Nenhum registro encontrado</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                audits.map(audit => (
                                    <>
                                        <tr 
                                            key={audit.id} 
                                            className={`
                                                group transition-colors cursor-pointer
                                                ${expandedAudit === audit.id ? 'bg-slate-50/80 dark:bg-slate-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}
                                            `}
                                            onClick={() => setExpandedAudit(expandedAudit === audit.id ? null : audit.id)}
                                        >
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">
                                                {formatDate(audit.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                                        {(audit.user?.name || 'S')[0].toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                        {audit.user ? audit.user.name : 'System'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getEventBadge(audit.event)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                    {audit.auditable_type.split('\\').pop()} 
                                                    <span className="text-slate-400">#</span>
                                                    {audit.auditable_id}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                                    {expandedAudit === audit.id ? <ChevronUp size={18} /> : <Eye size={18} />}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedAudit === audit.id && (
                                            <tr className="bg-slate-50/50 dark:bg-slate-800/30 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <td colSpan={5} className="px-6 pb-6 pt-2">
                                                    <div className="pl-8 border-l-2 border-slate-200 dark:border-slate-700 ml-3">
                                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <FileJson size={14} /> Detalhes da alteração
                                                        </h4>
                                                        {renderChanges(audit)}
                                                        
                                                        <div className="mt-4 flex gap-6 text-xs text-slate-500 font-mono">
                                                            <div>
                                                                <span className="font-bold text-slate-700 dark:text-slate-300">IP:</span> {audit.ip_address}
                                                            </div>
                                                            <div className="max-w-md truncate" title={audit.user_agent}>
                                                                <span className="font-bold text-slate-700 dark:text-slate-300">Agent:</span> {audit.user_agent}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
