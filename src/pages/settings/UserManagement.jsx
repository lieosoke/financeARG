import React, { useState } from 'react';
import { Search, Plus, User, Shield, Mail, Edit2, Trash2, X, Save, Lock, Eye, EyeOff, Key } from 'lucide-react';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/atoms/Table';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Badge from '../../components/atoms/Badge';
import { useUsers, useUpdateUser, useDeleteUser, useCreateUser, useUpdatePassword } from '../../hooks/useUsers';
import { roleConfig } from '../../config/permissions';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });

    // Create user modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [showPassword, setShowPassword] = useState(false);

    // Reset password modal state
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [resetPasswordUser, setResetPasswordUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);

    // API hooks
    const { data: users = [], isLoading, error } = useUsers();
    const updateUser = useUpdateUser();
    const deleteUser = useDeleteUser();
    const createUser = useCreateUser();
    const updatePassword = useUpdatePassword();

    const roles = [
        { value: 'all', label: 'Semua Role' },
        { value: 'owner', label: 'Owner' },
        { value: 'admin', label: 'Admin' },
        { value: 'finance', label: 'Finance' },
        { value: 'user', label: 'User' },
    ];

    const assignableRoles = [
        { value: 'owner', label: 'Owner' },
        { value: 'admin', label: 'Admin' },
        { value: 'finance', label: 'Finance' },
        { value: 'user', label: 'User' },
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
        setEditForm({ name: user.name || '', email: user.email, role: user.role });
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditForm({ name: '', email: '', role: '' });
    };

    const handleSaveEdit = async (userId) => {
        // Validate email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(editForm.email)) {
            toast.error('Format email tidak valid');
            return;
        }

        try {
            await updateUser.mutateAsync({ id: userId, data: editForm });
            toast.success('User berhasil diperbarui');
            setEditingUser(null);
            setEditForm({ name: '', email: '', role: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Gagal memperbarui user');
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

    const handleCreateUser = async (e) => {
        e.preventDefault();

        // Validation
        if (!createForm.name.trim()) {
            toast.error('Nama harus diisi');
            return;
        }
        if (!createForm.email.trim()) {
            toast.error('Email harus diisi');
            return;
        }
        if (!createForm.password || createForm.password.length < 6) {
            toast.error('Password minimal 6 karakter');
            return;
        }

        try {
            await createUser.mutateAsync(createForm);
            toast.success('User berhasil dibuat');
            setShowCreateModal(false);
            setCreateForm({ name: '', email: '', password: '', role: 'user' });
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Gagal membuat user');
        }
    };

    const handleOpenResetPassword = (user) => {
        setResetPasswordUser(user);
        setNewPassword('');
        setShowNewPassword(false);
        setShowResetPasswordModal(true);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!newPassword || newPassword.length < 6) {
            toast.error('Password baru minimal 6 karakter');
            return;
        }

        try {
            await updatePassword.mutateAsync({
                id: resetPasswordUser.id,
                data: { newPassword }
            });
            toast.success(`Password untuk ${resetPasswordUser.name || resetPasswordUser.email} berhasil direset`);
            setShowResetPasswordModal(false);
            setResetPasswordUser(null);
            setNewPassword('');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Gagal mereset password');
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
                <Button
                    className="btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus className="w-4 h-4" />
                    Tambah User
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-500/20 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'user').length}</p>
                            <p className="text-xs text-gray-500">User</p>
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
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>User</Th>
                                <Th>Email</Th>
                                <Th>Role</Th>
                                <Th>Created</Th>
                                <Th align="center">Aksi</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredData.map((user) => (
                                <Tr key={user.id}>
                                    <Td>
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
                                    </Td>
                                    <Td>
                                        {editingUser === user.id ? (
                                            <Input
                                                type="email"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                placeholder="Email user"
                                                className="w-56"
                                            />
                                        ) : (
                                            <span className="flex items-center gap-2 text-sm text-gray-400">
                                                <Mail className="w-4 h-4" />
                                                {user.email}
                                            </span>
                                        )}
                                    </Td>
                                    <Td>
                                        {editingUser === user.id ? (
                                            <select
                                                value={editForm.role}
                                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                                className="bg-dark-tertiary border border-surface-border rounded-lg px-3 py-2 text-white text-sm"
                                            >
                                                {assignableRoles.map(role => (
                                                    <option key={role.value} value={role.value}>{role.label}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            getRoleBadge(user.role)
                                        )}
                                    </Td>
                                    <Td className="text-gray-400">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
                                    </Td>
                                    <Td align="center">
                                        <div className="flex items-center justify-center gap-1">
                                            {editingUser === user.id ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="!p-2 text-emerald-400 hover:text-emerald-300"
                                                        onClick={() => handleSaveEdit(user.id)}
                                                        disabled={updateUser.isPending}
                                                        title="Simpan"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="!p-2"
                                                        onClick={handleCancelEdit}
                                                        title="Batal"
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
                                                        title="Edit User"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="!p-2 text-amber-400 hover:text-amber-300"
                                                        onClick={() => handleOpenResetPassword(user)}
                                                        title="Reset Password"
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="!p-2 text-rose-400 hover:text-rose-300"
                                                        onClick={() => handleDelete(user.id, user.name || user.email)}
                                                        disabled={deleteUser.isPending}
                                                        title="Hapus User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </Td>
                                </Tr>
                            ))}
                            {filteredData.length === 0 && (
                                <Tr>
                                    <Td colSpan={5} className="py-8 text-center text-gray-500">
                                        Tidak ada user ditemukan
                                    </Td>
                                </Tr>
                            )}
                        </Tbody>
                    </Table>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-border">
                    <p className="text-sm text-gray-500">
                        Menampilkan {filteredData.length} dari {users.length} user
                    </p>
                </div>
            </Card>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowCreateModal(false)}
                    />
                    <div className="relative bg-dark-secondary border border-surface-border rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-scale-in">
                        <div className="flex items-center justify-between p-6 border-b border-surface-border">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-primary-400" />
                                Tambah User Baru
                            </h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 rounded-lg hover:bg-surface-glass transition-colors text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nama Lengkap <span className="text-rose-400">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    icon={<User className="w-4 h-4" />}
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email <span className="text-rose-400">*</span>
                                </label>
                                <Input
                                    type="email"
                                    value={createForm.email}
                                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                    icon={<Mail className="w-4 h-4" />}
                                    placeholder="Masukkan email"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Password <span className="text-rose-400">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={createForm.password}
                                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                        icon={<Lock className="w-4 h-4" />}
                                        placeholder="Minimal 6 karakter"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Role
                                </label>
                                <select
                                    value={createForm.role}
                                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                                    className="w-full bg-dark-tertiary border border-surface-border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    {assignableRoles.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    className="btn-primary flex-1"
                                    disabled={createUser.isPending}
                                >
                                    {createUser.isPending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Tambah User
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetPasswordModal && resetPasswordUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowResetPasswordModal(false)}
                    />
                    <div className="relative bg-dark-secondary border border-surface-border rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-scale-in">
                        <div className="flex items-center justify-between p-6 border-b border-surface-border">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Key className="w-5 h-5 text-amber-400" />
                                Reset Password
                            </h2>
                            <button
                                onClick={() => setShowResetPasswordModal(false)}
                                className="p-2 rounded-lg hover:bg-surface-glass transition-colors text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                <p className="text-sm text-amber-300">
                                    Anda akan mereset password untuk:
                                </p>
                                <p className="text-white font-medium mt-1">
                                    {resetPasswordUser.name || 'Unnamed'} ({resetPasswordUser.email})
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Password Baru <span className="text-rose-400">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        icon={<Lock className="w-4 h-4" />}
                                        placeholder="Minimal 6 karakter"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => setShowResetPasswordModal(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    className="btn-primary flex-1"
                                    disabled={updatePassword.isPending}
                                >
                                    {updatePassword.isPending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Key className="w-4 h-4" />
                                            Reset Password
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
