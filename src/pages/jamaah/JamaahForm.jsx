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

            <form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Personal & Contact Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <Card>
                            <div className="p-4 border-b border-surface-border">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary-400" />
                                    Informasi Pribadi
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">Data identitas lengkap calon jamaah</p>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-4 gap-4 md:col-span-2">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                                        <select
                                            className="w-full px-4 py-2.5 rounded-lg bg-dark-tertiary border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
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
                                            placeholder="Masukkan nama sesuai KTP/Paspor"
                                            required
                                            error={errors.name?.message}
                                            {...register('name', { required: 'Nama wajib diisi' })}
                                        />
                                    </div>
                                </div>

                                <Input
                                    label="NIK / No. KTP"
                                    placeholder="16 digit NIK"
                                    icon={<CreditCard className="w-4 h-4" />}
                                    error={errors.nik?.message}
                                    {...register('nik', {
                                        pattern: { value: /^\d{16}$/, message: 'NIK harus 16 digit angka' },
                                    })}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Jenis Kelamin</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={`cursor-pointer border rounded-lg p-2.5 flex items-center justify-center gap-2 transition-all ${watch('gender') === 'male' ? 'bg-primary-500/10 border-primary-500 text-primary-400' : 'border-surface-border text-gray-400 hover:bg-white/5'}`}>
                                            <input type="radio" value="male" className="hidden" {...register('gender')} />
                                            <span className="text-sm font-medium">Laki-laki</span>
                                        </label>
                                        <label className={`cursor-pointer border rounded-lg p-2.5 flex items-center justify-center gap-2 transition-all ${watch('gender') === 'female' ? 'bg-primary-500/10 border-primary-500 text-primary-400' : 'border-surface-border text-gray-400 hover:bg-white/5'}`}>
                                            <input type="radio" value="female" className="hidden" {...register('gender')} />
                                            <span className="text-sm font-medium">Perempuan</span>
                                        </label>
                                    </div>
                                </div>

                                <Input
                                    label="Tanggal Lahir"
                                    type="date"
                                    placeholder="DD/MM/YYYY"
                                    error={errors.dateOfBirth?.message}
                                    {...register('dateOfBirth', { required: 'Tanggal lahir wajib diisi' })}
                                />

                                <Input
                                    label="Umur (Tahun)"
                                    placeholder="Otomatis"
                                    readOnly
                                    className="bg-dark-tertiary/50 text-gray-400 cursor-not-allowed"
                                    {...register('age')}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Status Pernikahan</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-lg bg-dark-tertiary border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                                        {...register('maritalStatus')}
                                    >
                                        <option value="single">Belum Menikah</option>
                                        <option value="married">Menikah</option>
                                        <option value="divorced">Cerai Hidup</option>
                                        <option value="widowed">Cerai Mati</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        {/* Contact & Address */}
                        <Card>
                            <div className="p-4 border-b border-surface-border">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-amber-400" />
                                    Kontak & Alamat
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">Informasi untuk menghubungi jamaah</p>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Nomor Telepon / WhatsApp"
                                    placeholder="Contoh: 081234567890"
                                    icon={<Phone className="w-4 h-4" />}
                                    error={errors.phone?.message}
                                    {...register('phone', { required: 'Nomor telepon wajib diisi' })}
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
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Alamat Lengkap</label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-lg bg-dark-tertiary border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow min-h-[100px] resize-y"
                                        placeholder="Nama jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten"
                                        {...register('address')}
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Package select & Payment */}
                    <div className="space-y-6">
                        <Card className="sticky top-6">
                            <div className="p-4 border-b border-surface-border bg-gradient-to-r from-emerald-900/20 to-transparent">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Package className="w-5 h-5 text-emerald-400" />
                                    Paket Layanan
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Pilih Paket <span className="text-rose-400">*</span>
                                    </label>
                                    <div className="relative">
                                        {packagesLoading ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-400 p-3 border border-surface-border rounded-lg bg-dark-tertiary/50">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Memuat paket...
                                            </div>
                                        ) : packagesError ? (
                                            <div className="text-rose-400 text-sm p-3 bg-rose-500/10 rounded-lg border border-rose-500/20 flex justify-between items-center">
                                                <span>Gagal memuat paket</span>
                                                <button type="button" onClick={() => refetchPackages()} className="underline hover:text-rose-300">Retry</button>
                                            </div>
                                        ) : (
                                            <select
                                                className="w-full px-4 py-3 rounded-lg bg-dark-tertiary border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow appearance-none"
                                                {...register('packageId', { required: 'Paket wajib dipilih' })}
                                            >
                                                <option value="">-- Pilih Paket --</option>
                                                {packages.map((pkg) => (
                                                    <option key={pkg.id} value={pkg.id}>
                                                        {pkg.name} ({pkg.code})
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    {errors.packageId && (
                                        <p className="mt-1.5 text-sm text-rose-400">{errors.packageId.message}</p>
                                    )}
                                </div>

                                <div className="bg-dark-tertiary/30 p-4 rounded-lg border border-surface-border space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Harga Paket:</span>
                                        <span className="text-white font-medium">
                                            {packages.find(p => p.id === watch('packageId'))
                                                ? formatCurrency(packages.find(p => p.id === watch('packageId')).pricePerPerson)
                                                : '-'}
                                        </span>
                                    </div>
                                    <div className="h-px bg-surface-border w-full" />

                                    <Input
                                        label="Total Biaya yang Disepakati"
                                        type="number"
                                        placeholder="Rp 0"
                                        required
                                        className="text-right font-mono font-medium"
                                        error={errors.totalAmount?.message}
                                        {...register('totalAmount', { required: 'Total biaya wajib diisi' })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        *Jika ada diskon atau penyesuaian harga, ubah nilai di atas.
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 border-t border-surface-border bg-dark-tertiary/20 flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    loading={isLoading}
                                    className="w-full justify-center"
                                    icon={<Save className="w-4 h-4" />}
                                >
                                    {isEditing ? 'Simpan Perubahan' : 'Buat Jamaah Baru'}
                                </Button>
                                <Link to="/jamaah">
                                    <Button variant="secondary" className="w-full justify-center">Batal</Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default JamaahForm;
