import React, { useState, useEffect } from 'react';
import { Building2, Phone, MapPin, Mail, Save, Edit2, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import { useCompanySettings, useUpdateCompanySettings } from '../../hooks/useCompanySettings';

const CompanySettings = () => {
    const { data: settingsData, isLoading, isError, error, refetch } = useCompanySettings();
    const updateMutation = useUpdateCompanySettings();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        phone: '',
        email: '',
    });
    const [showSuccess, setShowSuccess] = useState(false);

    // Load data into form when settings are fetched
    useEffect(() => {
        if (settingsData?.data) {
            setFormData({
                name: settingsData.data.name || '',
                address: settingsData.data.address || '',
                city: settingsData.data.city || '',
                phone: settingsData.data.phone || '',
                email: settingsData.data.email || '',
            });
        }
    }, [settingsData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync(formData);
            setIsEditing(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to save company settings:', err);
        }
    };

    const handleCancel = () => {
        // Reset form to original data
        if (settingsData?.data) {
            setFormData({
                name: settingsData.data.name || '',
                address: settingsData.data.address || '',
                city: settingsData.data.city || '',
                phone: settingsData.data.phone || '',
                email: settingsData.data.email || '',
            });
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="!p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Gagal Memuat Pengaturan</h3>
                    <p className="text-gray-400 mb-6">{error?.message || 'Terjadi kesalahan saat memuat pengaturan perusahaan.'}</p>
                    <Button onClick={() => refetch()} icon={<RefreshCw className="w-4 h-4" />}>
                        Coba Lagi
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header flex items-center justify-between">
                <div>
                    <h1 className="page-title">Pengaturan Perusahaan</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola informasi perusahaan Anda</p>
                </div>
                <div className="flex items-center gap-2">
                    {showSuccess && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm animate-fade-in">
                            <CheckCircle className="w-4 h-4" />
                            <span>Berhasil disimpan</span>
                        </div>
                    )}
                    {!isEditing ? (
                        <Button
                            icon={<Edit2 className="w-4 h-4" />}
                            onClick={() => setIsEditing(true)}
                        >
                            Edit
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="secondary"
                                onClick={handleCancel}
                            >
                                Batal
                            </Button>
                            <Button
                                icon={<Save className="w-4 h-4" />}
                                onClick={handleSave}
                                isLoading={updateMutation.isPending}
                            >
                                Simpan
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Settings Card */}
            <Card>
                <div className="space-y-6">
                    {/* Company Name */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-primary-400" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Nama Perusahaan <span className="text-rose-400">*</span>
                            </label>
                            {isEditing ? (
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Masukkan nama perusahaan"
                                    required
                                />
                            ) : (
                                <p className="text-white font-medium">
                                    {formData.name || <span className="text-gray-500 italic">Belum diatur</span>}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Alamat
                            </label>
                            {isEditing ? (
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Masukkan alamat lengkap"
                                />
                            ) : (
                                <p className="text-white">
                                    {formData.address || <span className="text-gray-500 italic">Belum diatur</span>}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* City */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Kota
                            </label>
                            {isEditing ? (
                                <Input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Masukkan kota"
                                />
                            ) : (
                                <p className="text-white">
                                    {formData.city || <span className="text-gray-500 italic">Belum diatur</span>}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Phone className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Nomor Telepon
                            </label>
                            {isEditing ? (
                                <Input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Masukkan nomor telepon"
                                />
                            ) : (
                                <p className="text-white">
                                    {formData.phone || <span className="text-gray-500 italic">Belum diatur</span>}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Mail className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Email
                            </label>
                            {isEditing ? (
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Masukkan email perusahaan"
                                />
                            ) : (
                                <p className="text-white">
                                    {formData.email || <span className="text-gray-500 italic">Belum diatur</span>}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Info Card */}
            <Card className="!p-4">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">
                            Informasi perusahaan ini akan ditampilkan pada invoice, kwitansi, dan dokumen lainnya.
                            Pastikan data yang dimasukkan akurat dan up-to-date.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CompanySettings;
