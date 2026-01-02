import React, { useState, useEffect } from 'react';
import Card from '../../components/molecules/Card';
import Input from '../../components/atoms/Input';
import Button from '../../components/atoms/Button';
import { User, Mail, Lock, Shield, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usersApi } from '../../services/api/users';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Sync form data when user context updates
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
            }));
        }
    }, [user]);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
            setMessage({ type: 'error', text: 'Format email tidak valid' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // eslint-disable-next-line no-unused-vars
            const { currentPassword, newPassword, confirmPassword, ...profileData } = formData;
            const response = await usersApi.update(user.id, profileData);

            if (response.success || response.data) {
                setMessage({ type: 'success', text: 'Profil berhasil diperbarui' });
                // Update auth context directly with new data
                updateUser({
                    name: formData.name,
                    email: formData.email,
                });
            }
        } catch (error) {
            console.error('Update profile error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Gagal memperbarui profil'
            });
        } finally {
            setLoading(false);
        }
    };


    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Password konfirmasi tidak cocok' });
            return;
        }

        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password baru minimal 6 karakter' });
            return;
        }

        setPasswordLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await usersApi.updatePassword(user.id, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            if (response.success) {
                setMessage({ type: 'success', text: 'Password berhasil diubah' });
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
            }
        } catch (error) {
            console.error('Update password error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Gagal mengubah password'
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-3">
                        <User className="w-8 h-8 text-primary-400" />
                        Profil Saya
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola informasi profil dan keamanan akun Anda
                    </p>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {message.type === 'success' ? <Shield className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <Card>
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-3xl shadow-glow-emerald">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">
                                {user?.name || 'Admin User'}
                            </h3>
                            <p className="text-sm text-gray-400 mb-4">
                                {user?.email || 'admin@argtour.com'}
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-lg border border-primary-500/30">
                                <Shield className="w-4 h-4" />
                                <span className="text-sm font-medium capitalized">{user?.role || 'User'}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Settings Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <Card title="Informasi Pribadi">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nama Lengkap
                                </label>
                                <Input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    icon={<User className="w-5 h-5" />}
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    icon={<Mail className="w-5 h-5" />}
                                    placeholder="Masukkan email"
                                />
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="btn-primary" disabled={loading}>
                                    <Save className="w-4 h-4" />
                                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </form>
                    </Card>

                    {/* Change Password */}
                    <Card title="Ubah Password">
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Password Saat Ini
                                </label>
                                <Input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    icon={<Lock className="w-5 h-5" />}
                                    placeholder="Masukkan password saat ini"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Password Baru
                                </label>
                                <Input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    icon={<Lock className="w-5 h-5" />}
                                    placeholder="Masukkan password baru"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Konfirmasi Password Baru
                                </label>
                                <Input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    icon={<Lock className="w-5 h-5" />}
                                    placeholder="Konfirmasi password baru"
                                />
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="btn-primary" disabled={passwordLoading}>
                                    <Lock className="w-4 h-4" />
                                    {passwordLoading ? 'Menyimpan...' : 'Ubah Password'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
