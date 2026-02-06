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
    Key,
    Trash2
} from 'lucide-react';
import Pagination from '@/app/components/Pagination';
import UserModal from '@/app/components/users/UserModal';
import UserFilterBar from '@/app/components/users/UserFilterBar';
import PasswordModal from '@/app/components/users/PasswordModal';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
    is_active: boolean;
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
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [passwordModal, setPasswordModal] = useState({ isOpen: false, userId: null as number | null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null as number | null });
    const [isDeleting, setIsDeleting] = useState(false);


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
                setUsers(response.data.data.filter((user: User) => user.roles.some((role: Role) => role.slug !== 'admin')));
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
                setRoles(response.data.filter((role: Role) => role.slug !== 'admin'));
            }
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        // Roles now handled inside UserModal via initialData
    };

    const handleUpdateUser = async (updatedData: any) => {
        if (!editingUser) return;
        setIsSaving(true);
        try {
            const res = await fetch(`${apiUrl}/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    'Accept-Language': 'pt'
                },
                body: JSON.stringify(updatedData)
            });

            if (res.ok) {
                await fetchData(meta.current_page);
                setEditingUser(null);
                toast.success(t('users.update_success'));
            } else {
                const data = await res.json();
                if (data.errors) {
                    toast.error(Object.values(data.errors).flat().join('\n'));
                } else {
                    toast.error(t('users.update_error'));
                }
            }
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async (password: string) => {
        if (!passwordModal.userId) return;
        setIsSaving(true);
        try {
            const res = await fetch(`${apiUrl}/users/${passwordModal.userId}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    'Accept-Language': 'pt'
                },
                body: JSON.stringify({ password, password_confirmation: password })
            });

            console.log(res);
            if (res.ok) {
                setPasswordModal({ isOpen: false, userId: null });
                toast.success(t('users.password_success'));
            } else {
                const data = await res.json();
                if (data.errors) {
                    const messages = Object.values(data.errors).flat().join('\n');
                    toast.error(messages);
                } else {
                    toast.error(data.message || t('common.error'));
                }
            }
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteModal.userId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`${apiUrl}/users/${deleteModal.userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                await fetchData(meta.current_page);
                setDeleteModal({ isOpen: false, userId: null });
                toast.success(t('users.delete_success'));
            } else {
                toast.error(t('users.delete_error'));
            }
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setIsDeleting(false);
        }
    };



    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleCreateUser = async (userData: any) => {
        setIsSaving(true);
        try {
            const res = await fetch(`${apiUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    'Accept-Language': 'pt'
                },
                body: JSON.stringify(userData)
            });

            if (res.ok) {
                await fetchData();
                setIsCreateModalOpen(false);
                toast.success(t('users.create_success'));
            } else {
                const data = await res.json();
                if (data.errors) {
                    const messages = Object.values(data.errors).flat().join('\n');
                    toast.error(messages);
                } else {
                    toast.error(data.message || t('common.error'));
                }
            }
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setIsSaving(false);
        }
    };

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

            {/* Filter Bar */}
            <UserFilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onNewUser={() => setIsCreateModalOpen(true)}
            />

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('common.name')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('users.email')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('users.roles')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('users.status')}</th>
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
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.is_active
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                            }`}>
                                            {user.is_active ? (t('users.active') || 'Ativo') : (t('users.inactive') || 'Inativo')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setPasswordModal({ isOpen: true, userId: user.id })}
                                                className="p-2 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                                title={t('users.password_title')}
                                            >
                                                <Key size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                                title={t('admin.edit')}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, userId: user.id })}
                                                className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title={t('common.delete')}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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

            {/* Create User Modal */}
            <UserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateUser}
                roles={roles}
                isSaving={isSaving}
            />

            {/* Edit User Modal */}
            <UserModal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                onSubmit={handleUpdateUser}
                roles={roles}
                isSaving={isSaving}
                initialData={editingUser}
            />

            {/* Password Modal */}
            <PasswordModal
                isOpen={passwordModal.isOpen}
                onClose={() => setPasswordModal({ isOpen: false, userId: null })}
                onSubmit={handleUpdatePassword}
                isSaving={isSaving}
            />

            {/* Delete Confirmation */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, userId: null })}
                onConfirm={handleDeleteUser}
                isDeleting={isDeleting}
                message={t('users.delete_confirm_message')}
            />
        </div>
    );
}