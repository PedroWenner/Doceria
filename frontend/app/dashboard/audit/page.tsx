'use client';

import { useState, useEffect } from 'react';
import GlassCard from '@/app/components/GlassCard';
import Cookies from 'js-cookie';
import { useLanguage } from '@/app/context/LanguageContext';

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
    const token = Cookies.get('auth_token');

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
        return new Date(dateString).toLocaleString();
    };

    const getEventBadge = (event: string) => {
        const styles: Record<string, string> = {
            created: 'bg-green-100 text-green-800 border-green-200',
            updated: 'bg-blue-100 text-blue-800 border-blue-200',
            deleted: 'bg-red-100 text-red-800 border-red-200',
            restored: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
        const label = t(`audit.${event}`) || event;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold border capitalize ${styles[event] || 'bg-gray-100 text-gray-800'}`}>
                {label}
            </span>
        );
    };

    const renderChanges = (audit: Audit) => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono bg-white/40 p-3 rounded-lg border border-brand-gold/20">
                <div>
                    <strong className="block text-brand-pink mb-1">{t('audit.old_values')}</strong>
                    <pre className="whitespace-pre-wrap text-brand-choco/70">{JSON.stringify(audit.old_values, null, 2)}</pre>
                </div>
                <div>
                    <strong className="block text-brand-pink mb-1">{t('audit.new_values')}</strong>
                    <pre className="whitespace-pre-wrap text-brand-choco/70">{JSON.stringify(audit.new_values, null, 2)}</pre>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-brand-choco">{t('audit.title')}</h1>

            {/* Filters */}
            <GlassCard className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-brand-choco mb-1">{t('audit.filter_user')}</label>
                        <select
                            className="w-full p-2 rounded-lg bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-brand-pink/50 text-brand-choco"
                            value={filterUser}
                            onChange={e => setFilterUser(e.target.value)}
                        >
                            <option value="">All Users</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-brand-choco mb-1">{t('audit.filter_event')}</label>
                        <select
                            className="w-full p-2 rounded-lg bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-brand-pink/50 text-brand-choco capitalize"
                            value={filterEvent}
                            onChange={e => setFilterEvent(e.target.value)}
                        >
                            <option value="">All Events</option>
                            <option value="created">{t('audit.created')}</option>
                            <option value="updated">{t('audit.updated')}</option>
                            <option value="deleted">{t('audit.deleted')}</option>
                            <option value="restored">{t('audit.restored')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-brand-choco mb-1">{t('audit.date')} (From)</label>
                        <input
                            type="date"
                            className="w-full p-2 rounded-lg bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-brand-pink/50 text-brand-choco"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-brand-choco mb-1">{t('audit.date')} (To)</label>
                        <input
                            type="date"
                            className="w-full p-2 rounded-lg bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-brand-pink/50 text-brand-choco"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                        />
                    </div>
                </div>
            </GlassCard>

            {/* Table */}
            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-brand-pink/20 text-brand-choco uppercase text-sm font-bold">
                            <tr>
                                <th className="px-6 py-4">{t('audit.date')}</th>
                                <th className="px-6 py-4">{t('audit.user')}</th>
                                <th className="px-6 py-4">{t('audit.event')}</th>
                                <th className="px-6 py-4">{t('audit.auditable')}</th>
                                <th className="px-6 py-4 text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-choco/10">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-brand-choco/60">{t('common.loading')}</td>
                                </tr>
                            ) : audits.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-brand-choco/60">No logs found</td>
                                </tr>
                            ) : (
                                audits.map(audit => (
                                    <>
                                        <tr key={audit.id} className="hover:bg-white/20 transition-colors cursor-pointer" onClick={() => setExpandedAudit(expandedAudit === audit.id ? null : audit.id)}>
                                            <td className="px-6 py-4 text-sm text-brand-choco/80">{formatDate(audit.created_at)}</td>
                                            <td className="px-6 py-4 font-bold text-brand-choco">
                                                {audit.user ? audit.user.name : 'System/Unknown'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getEventBadge(audit.event)}
                                            </td>
                                            <td className="px-6 py-4 text-brand-choco/80 text-sm">
                                                {audit.auditable_type.split('\\').pop()} #{audit.auditable_id}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-xl">{expandedAudit === audit.id ? '🔼' : '🔽'}</span>
                                            </td>
                                        </tr>
                                        {expandedAudit === audit.id && (
                                            <tr className="bg-brand-pink/5">
                                                <td colSpan={5} className="px-6 py-4">
                                                    {renderChanges(audit)}
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}
