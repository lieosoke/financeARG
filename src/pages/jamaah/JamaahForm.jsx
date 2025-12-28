import React, { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, User, Phone, MapPin, CreditCard, Package, Loader2, Mail, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import { usePackages } from '../../hooks/usePackages';
import { useJamaah, useCreateJamaah, useUpdateJamaah, jamaahKeys } from '../../hooks/useJamaah';
import { formatCurrency } from '../../utils/formatters';
import { formatDateToID, parseDateFromID, formatDateForAPI, calculateAge, isValidIDDate } from '../../utils/dateUtils';
import { useQueryClient } from '@tanstack/react-query';

const JamaahForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);
    const queryClient = useQueryClient();

    // Fetch existing jamaah data when editing
    const { data: jamaahData, isLoading: jamaahLoading, isError: jamaahError, error: jamaahErrorInfo, refetch: refetchJamaah } = useJamaah(id || '', {
        enabled: isEditing,
    });
    const existingJamaah = jamaahData?.data;

    // Mutation hooks
    const createMutation = useCreateJamaah({
        onSuccess: () => {
            toast.success('Jamaah berhasil ditambahkan');
            queryClient.invalidateQueries(jamaahKeys.lists());
            navigate('/jamaah');
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal menambahkan jamaah');
        },
    });

    const updateMutation = useUpdateJamaah({
        onSuccess: () => {
            toast.success('Jamaah berhasil diperbarui');
            queryClient.invalidateQueries(jamaahKeys.detail(id));
            queryClient.invalidateQueries(jamaahKeys.lists());
            navigate('/jamaah');
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal memperbarui jamaah');
        },
    });

    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            title: 'Mr',
            name: '',
            nik: '',
            gender: 'male',
            maritalStatus: 'single',
            dateOfBirth: '',
            phone: '',
            address: '',
            email: '',
            packageId: '',
            totalAmount: '',
            paidAmount: '',
        },
    });

    // Watch dateOfBirth to calculate age
    const dateOfBirthValue = watch('dateOfBirth');

    useEffect(() => {
        if (dateOfBirthValue && isValidIDDate(dateOfBirthValue)) {
            setValue('age', calculateAge(dateOfBirthValue));
        } else {
            setValue('age', '');
        }
    }, [dateOfBirthValue, setValue]);

    // Populate form when editing
    useEffect(() => {
        if (existingJamaah) {
            reset({
                title: existingJamaah.title || 'Mr',
                name: existingJamaah.name || '',
                nik: existingJamaah.nik || '',
                gender: existingJamaah.gender || 'male',
                maritalStatus: existingJamaah.maritalStatus || 'single',
                dateOfBirth: existingJamaah.dateOfBirth ? formatDateToID(existingJamaah.dateOfBirth) : '',
                phone: existingJamaah.phone || '',
                address: existingJamaah.address || '',
                email: existingJamaah.email || '',
                packageId: existingJamaah.packageId || '',
                totalAmount: existingJamaah.totalAmount || '',
                paidAmount: existingJamaah.paidAmount || '',
            });
        }
    }, [existingJamaah, reset]);

    // Fetch packages from API (only active/open packages)
    const { data: packagesData, isLoading: packagesLoading, isError: packagesError, refetch: refetchPackages } = usePackages({
        status: 'open',
        limit: 100
    });
    const packages = packagesData?.data || [];

    const onSubmit = async (data) => {
        // Map form data to API schema
        const payload = {
            title: data.title,
            name: data.name,
            nik: data.nik || undefined,
            gender: data.gender,
            maritalStatus: data.maritalStatus,
            dateOfBirth: data.dateOfBirth ? formatDateForAPI(data.dateOfBirth) : undefined,
            phone: data.phone || undefined,
            email: data.email || undefined,
            address: data.address || undefined,
            packageId: data.packageId || undefined,
            totalAmount: data.totalAmount || '0',
            paidAmount: data.paidAmount || '0',
        };

        if (isEditing) {
            updateMutation.mutate({ id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

    // Show error state if fetching failed
    if (isEditing && jamaahError) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="max-w-md w-full text-center p-8">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Gagal Memuat Data</h3>
                    <p className="text-gray-400 mb-6">
                        {jamaahErrorInfo?.message || 'Terjadi kesalahan saat memuat data jamaah.'}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/jamaah">
                            <Button variant="secondary">Kembali</Button>
                        </Link>
                        <Button onClick={() => refetchJamaah()} icon={<RefreshCw className="w-4 h-4" />}>
                            Coba Lagi
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // Show loading when fetching existing data
    if (isEditing && jamaahLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-3" />
                    <p className="text-gray-400">Memuat data jamaah...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header flex items-center gap-4">
                <Link to="/jamaah">
                    <Button variant="ghost" size="sm" className="!p-2">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="page-title">
                        {isEditing ? 'Edit Jamaah' : 'Tambah Jamaah Baru'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isEditing ? 'Perbarui data jamaah' : 'Daftarkan jamaah baru ke sistem'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <Card title="Informasi Pribadi" subtitle="Data diri jamaah">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid grid-cols-4 gap-4 md:col-span-2">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Title
                                </label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                                    {...register('title')}
                                >
                                    <option value="Mr">Mr</option>
                                    <option value="Mstr">Mstr</option>
                                    <option value="Mrs">Mrs</option>
                                    <option value="Miss">Miss</option>
                                    <option value="Infant">Infant</option>
                                </select>
                            </div>
                            <div className="col-span-3">
                                <Input
                                    label="Nama Lengkap"
                                    placeholder="Masukkan nama lengkap"
                                    required
                                    icon={<User className="w-4 h-4" />}
                                    error={errors.name?.message}
                                    {...register('name', { required: 'Nama wajib diisi' })}
                                />
                            </div>
                        </div>

                        <Input
                            label="Tanggal Lahir"
                            placeholder="DD/MM/YYYY"
                            error={errors.dateOfBirth?.message}
                            {...register('dateOfBirth', {
                                validate: (val) => !val || isValidIDDate(val) || 'Format harus DD/MM/YYYY'
                            })}
                        />
                        <Input
                            label="Umur"
                            placeholder="Otomatis"
                            readOnly
                            className="bg-dark-tertiary/30 cursor-not-allowed"
                            {...register('age')}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Jenis Kelamin
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                                {...register('gender')}
                            >
                                <option value="male">Laki-laki</option>
                                <option value="female">Perempuan</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Status Pernikahan
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                                {...register('maritalStatus')}
                            >
                                <option value="single">Belum Menikah</option>
                                <option value="married">Menikah</option>
                                <option value="divorced">Cerai Hidup</option>
                                <option value="widowed">Cerai Mati</option>
                            </select>
                        </div>
                        <Input
                            label="NIK"
                            placeholder="16 digit NIK"
                            icon={<CreditCard className="w-4 h-4" />}
                            error={errors.nik?.message}
                            {...register('nik', {
                                pattern: {
                                    value: /^(\d{16})?$/,
                                    message: 'NIK harus 16 digit atau kosong',
                                },
                            })}
                        />
                        <Input
                            label="Nomor Telepon"
                            placeholder="08xxxxxxxxxx"
                            icon={<Phone className="w-4 h-4" />}
                            error={errors.phone?.message}
                            {...register('phone')}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="email@example.com"
                            icon={<Mail className="w-4 h-4" />}
                            error={errors.email?.message}
                            {...register('email', {
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: 'Format email tidak valid',
                                },
                            })}
                        />
                        <div className="md:col-span-2">
                            <Input
                                label="Alamat"
                                placeholder="Alamat lengkap"
                                icon={<MapPin className="w-4 h-4" />}
                                error={errors.address?.message}
                                {...register('address')}
                            />
                        </div>
                    </div>
                </Card>

                {/* Package Selection */}
                <Card title="Paket & Pembayaran" subtitle="Pilih paket dan informasi pembayaran awal">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Paket <span className="text-rose-400 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <Package className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                {packagesLoading ? (
                                    <div className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                        <span className="text-gray-500">Memuat paket...</span>
                                    </div>
                                ) : packagesError ? (
                                    <div className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-rose-500/50 flex items-center justify-between gap-2 text-rose-400">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            <span className="text-sm">Gagal memuat paket</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => refetchPackages()}
                                            className="text-xs underline hover:text-rose-300"
                                        >
                                            Coba lagi
                                        </button>
                                    </div>
                                ) : (
                                    <select
                                        className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 appearance-none"
                                        {...register('packageId', { required: 'Paket wajib dipilih' })}
                                    >
                                        <option value="">Pilih Paket</option>
                                        {packages.length === 0 ? (
                                            <option value="" disabled>Tidak ada paket tersedia</option>
                                        ) : (
                                            packages.map((pkg) => (
                                                <option key={pkg.id} value={pkg.id}>
                                                    {pkg.name} ({pkg.code}) - {formatCurrency(parseFloat(pkg.pricePerPerson) || 0)}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                )}
                            </div>
                            {errors.packageId && (
                                <p className="mt-1.5 text-sm text-rose-400">{errors.packageId.message}</p>
                            )}
                        </div>
                        <Input
                            label="Total Biaya"
                            type="number"
                            placeholder="Masukkan total biaya"
                            required
                            error={errors.totalAmount?.message}
                            {...register('totalAmount', { required: 'Total biaya wajib diisi' })}
                        />
                        <Input
                            label="Jumlah Dibayar (DP)"
                            type="number"
                            placeholder="Masukkan jumlah DP"
                            error={errors.paidAmount?.message}
                            {...register('paidAmount')}
                        />
                    </div>
                </Card>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Link to="/jamaah">
                        <Button variant="secondary">Batal</Button>
                    </Link>
                    <Button
                        type="submit"
                        loading={isLoading}
                        icon={<Save className="w-4 h-4" />}
                    >
                        {isEditing ? 'Simpan Perubahan' : 'Tambah Jamaah'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default JamaahForm;
