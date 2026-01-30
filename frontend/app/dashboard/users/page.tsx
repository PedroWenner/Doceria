'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import Cookies from 'js-cookie';
import { useLanguage } from '@/app/context/LanguageContext';
import { toast } from 'react-hot-toast';
import {
    Users,
    Shield,
    Mail,
    Pencil,
    Search,
    X,
    Check,
    Briefcase
} from 'lucide-react';
import Pagination from '@/app/components/Pagination';

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface Role {
    id: number;
    name: string;
    slug: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 10 });
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { t } = useLanguage();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = Cookies.get('admin_token');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (page = 1) => {
        try {
            const [usersRes, rolesRes] = await Promise.all([
                fetch(`${apiUrl}/users?page=${page}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${apiUrl}/roles`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (usersRes.ok) {
                const response = await usersRes.json();
                setUsers(response.data.data);
                setMeta(prev => ({
                    ...prev,
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    per_page: response.data.per_page
                }));
            }
            if (rolesRes.ok) {
                const response = await rolesRes.json();
                setRoles(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
            toast.error(t('common.error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setSelectedRoles(user.roles.map(r => r.slug));
    };

    const handleSave = async () => {
        if (!editingUser) return;
        setIsSaving(true);

        try {
            const res = await fetch(`${apiUrl}/users/${editingUser.id}/roles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ roles: selectedRoles })
            });

            if (res.ok) {
                await fetchData();
                setEditingUser(null);
                toast.success(t('users.update_success'));
            } else {
                toast.error(t('users.update_error'));
            }
        } catch (error) {
            console.error('Update failed', error);
            toast.error(t('common.error'));
        } finally {
            setIsSaving(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-3">
                        <Users size={32} className="text-slate-400" />
                        {t('users.title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm ml-11">{t('users.subtitle')}</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder={t('users.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('common.name')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('users.email')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('users.roles')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-sm">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                                            <Mail size={14} className="text-slate-400" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {user.roles.map(role => (
                                                <span key={role.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30">
                                                    <Shield size={10} />
                                                    {role.name}
                                                </span>
                                            ))}
                                            {user.roles.length === 0 && (
                                                <span className="text-xs text-slate-400 italic">{t('users.no_permissions')}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                            title={t('Editar Permissões')}
                                        >
                                            <Pencil size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-500 dark:text-slate-400">
                                        <p>{t('users.no_users')}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={meta.current_page}
                    lastPage={meta.last_page}
                    total={meta.total}
                    perPage={meta.per_page}
                    onPageChange={fetchData}
                />
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-scaleIn">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t('users.edit_roles')}</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{editingUser.name}</p>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('users.available_roles')}</p>
                            <div className="space-y-2">
                                {roles.map(role => {
                                    const isSelected = selectedRoles.includes(role.slug);
                                    return (
                                        <label key={role.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isSelected
                                                ? 'bg-slate-50 dark:bg-slate-900 border-slate-900 dark:border-slate-50 shadow-sm'
                                                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected
                                                ? 'bg-slate-900 dark:bg-slate-50 border-slate-900 dark:border-slate-50 text-white dark:text-slate-900'
                                                : 'border-slate-300 dark:border-slate-600'
                                                }`}>
                                                {isSelected && <Check size={14} strokeWidth={3} />}
                                            </div>
                                            <input
                                                type="checkbox" // Changed to checkbox to allow multiple roles logic if needed, but handled as logic below
                                                className="hidden"
                                                checked={isSelected}
                                                onChange={() => {
                                                    // Allow Toggle logic: If user wants single role, we can change this. The original code seemed to support multiple roles visually but used radio logic. 
                                                    // Let's assume radio logic for primary role as per previous behavior, OR toggle.
                                                    // Original code: setSelectedRoles([role.slug]) -> Radio behavior.
                                                    // Let's keep Radio behavior for safety unless user requested otherwise, but styled better.
                                                    setSelectedRoles([role.slug]);
                                                }}
                                            />
                                            <div className="flex-1">
                                                <div className={`font-semibold ${isSelected ? 'text-slate-900 dark:text-slate-50' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {role.name}
                                                </div>
                                                <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                                                    {role.slug}
                                                </div>
                                            </div>
                                            <Briefcase size={18} className={isSelected ? 'text-slate-900 dark:text-slate-50' : 'text-slate-300'} />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-5 py-2 rounded-lg bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm disabled:opacity-70 disabled:cursor-wait flex items-center gap-2"
                            >
                                {isSaving ? <LoadingSpinner /> : <><Check size={18} /> {t('common.save')}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
