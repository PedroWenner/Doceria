'use client';

import { useState, useEffect } from 'react';
import GlassCard from '@/app/components/GlassCard';
import Cookies from 'js-cookie';

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
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = Cookies.get('auth_token');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, rolesRes] = await Promise.all([
                fetch(`${apiUrl}/users`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${apiUrl}/roles`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (usersRes.ok) {
                const data = await usersRes.json();
                setUsers(data.data); // Pagination 'data' key
            }
            if (rolesRes.ok) {
                const data = await rolesRes.json();
                setRoles(data);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setSelectedRoles(user.roles.map(r => r.slug));
    };

    const handleRoleToggle = (slug: string) => {
        setSelectedRoles(prev =>
            prev.includes(slug) ? prev.filter(r => r !== slug) : [...prev, slug]
        );
    };

    const handleSave = async () => {
        if (!editingUser) return;
        setIsSaving(true);

        try {
            const res = await fetch(`${apiUrl}/users/${editingUser.id}/roles`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ roles: selectedRoles })
            });

            if (res.ok) {
                await fetchData(); // Refresh list
                setEditingUser(null);
            } else {
                alert('Failed to update roles');
            }
        } catch (error) {
            console.error('Update failed', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-brand-choco">Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-brand-choco mb-8">User Management</h1>

            <GlassCard className="overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-brand-pink/20 text-brand-choco uppercase text-sm font-bold">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Roles</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-choco/10">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-white/20 transition-colors">
                                <td className="px-6 py-4 font-medium text-brand-choco">{user.name}</td>
                                <td className="px-6 py-4 text-brand-choco/80">{user.email}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {user.roles.map(role => (
                                            <span key={role.id} className="px-2 py-1 rounded-full bg-brand-gold/20 text-brand-choco text-xs font-bold border border-brand-gold/40">
                                                {role.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-brand-pink hover:text-brand-choco font-bold transition-colors"
                                    >
                                        Edit Roles
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>

            {editingUser && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <GlassCard className="w-full max-w-md">
                        <h2 className="text-2xl font-bold text-brand-choco mb-4">Edit Roles: {editingUser.name}</h2>

                        <div className="space-y-3 mb-6">
                            {roles.map(role => (
                                <label key={role.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/40 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedRoles.includes(role.slug)}
                                        onChange={() => handleRoleToggle(role.slug)}
                                        className="h-5 w-5 text-brand-pink focus:ring-brand-pink border-gray-300 rounded"
                                    />
                                    <span className="text-brand-choco font-medium">{role.name}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="px-4 py-2 rounded-lg text-brand-choco/60 hover:bg-white/40 font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 rounded-lg bg-brand-choco text-brand-cream hover:bg-brand-choco/90 font-bold transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
