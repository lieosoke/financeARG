import React, { useState } from 'react';
import { Search, Plus, User, Shield, Mail, Edit2, Trash2, ChevronLeft, ChevronRight, X, Save } from 'lucide-react';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Badge from '../../components/atoms/Badge';
import { useUsers, useUpdateUser, useDeleteUser } from '../../hooks/useUsers';
import { roleConfig, ROLES } from '../../config/permissions';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', role: '' });

    // API hooks
    const { data: users = [], isLoading, error } = useUsers();
    const updateUser = useUpdateUser();
    const deleteUser = useDeleteUser();

    const roles = [
        { value: 'all', label: 'Semua Role' },
        { value: 'owner', label: 'Owner' },
        { value: 'admin', label: 'Admin' },
        { value: 'finance', label: 'Finance' },
    ];

    const getRoleBadge = (role) => {
        const config = roleConfig[role] || { variant: 'neutral', label: role };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const filteredData = users.filter(user => {
        const matchSearch = (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchFilter = filterRole === 'all' || user.role === filterRole;
        return matchSearch && matchFilter;
    });

    const handleEdit = (user) => {
        setEditingUser(user.id);
        setEditForm({ name: user.name || '', role: user.role });
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditForm({ name: '', role: '' });
    };

    const handleSaveEdit = async (userId) => {
        try {
            await updateUser.mutateAsync({ id: userId, data: editForm });
            toast.success('User berhasil diperbarui');
            setEditingUser(null);
            setEditForm({ name: '', role: '' });
        } catch (err) {
            toast.error(err.message || 'Gagal memperbarui user');
        }
    };

    const handleDelete = async (userId, userName) => {
        if (!window.confirm(`Yakin ingin menghapus user "${userName}"?`)) return;

        try {
            await deleteUser.mutateAsync(userId);
            toast.success('User berhasil dihapus');
        } catch (err) {
            toast.error(err.message || 'Gagal menghapus user');
        }
    };

    const getInitials = (name, email) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        }
        return email.substring(0, 2).toUpperCase();
    };

    if (error) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Card className="!p-8 text-center">
                    <div className="text-rose-400 mb-2">Error</div>
                    <p className="text-gray-400">{error.message || 'Gagal memuat data user'}</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola pengguna sistem</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{users.length}</p>
                            <p className="text-xs text-gray-500">Total User</p>
                        </div>
                    </div>
                </Card>
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'owner').length}</p>
                            <p className="text-xs text-gray-500">Owner</p>
                        </div>
                    </div>
                </Card>
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'finance').length}</p>
                            <p className="text-xs text-gray-500">Finance</p>
                        </div>
                    </div>
                </Card>
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
                            <p className="text-xs text-gray-500">Admin</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari nama atau email..."
                            icon={<Search className="w-4 h-4" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {roles.map((role) => (
                            <Button
                                key={role.value}
                                variant={filterRole === role.value ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setFilterRole(role.value)}
                            >
                                {role.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* User Table */}
            <Card>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-6 px-6">
                        <table className="table-dark w-full">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                {filteredData.map((user) => (
                                    <tr key={user.id} className="hover:bg-surface-glass transition-colors">
                                        <td className="px-4 py-4">
                                            {editingUser === user.id ? (
                                                <Input
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    placeholder="Nama user"
                                                    className="w-48"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm">
                                                        {getInitials(user.name, user.email)}
                                                    </div>
                                                    <span className="font-medium text-white">{user.name || 'Unnamed'}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="flex items-center gap-2 text-sm text-gray-400">
                                                <Mail className="w-4 h-4" />
                                                {user.email}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {editingUser === user.id ? (
                                                <select
                                                    value={editForm.role}
                                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                                    className="bg-dark-tertiary border border-surface-border rounded-lg px-3 py-2 text-white text-sm"
                                                >
                                                    <option value="owner">Owner</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="finance">Finance</option>
                                                </select>
                                            ) : (
                                                getRoleBadge(user.role)
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-400">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {editingUser === user.id ? (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="!p-2 text-emerald-400 hover:text-emerald-300"
                                                            onClick={() => handleSaveEdit(user.id)}
                                                            disabled={updateUser.isPending}
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="!p-2"
                                                            onClick={handleCancelEdit}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="!p-2"
                                                            onClick={() => handleEdit(user)}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="!p-2 text-rose-400 hover:text-rose-300"
                                                            onClick={() => handleDelete(user.id, user.name || user.email)}
                                                            disabled={deleteUser.isPending}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            Tidak ada user ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-border">
                    <p className="text-sm text-gray-500">
                        Menampilkan {filteredData.length} dari {users.length} user
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default UserManagement;
