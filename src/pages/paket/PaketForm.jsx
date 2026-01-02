import React, { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Package, Calendar, Users, FileText, Plane, Loader2, AlertCircle, RefreshCw, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import { usePackage, useCreatePackage, useUpdatePackage } from '../../hooks/usePackages';
import { formatDateToID, parseDateFromID, formatDateForAPI, isValidIDDate } from '../../utils/dateUtils';

const PaketForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    // Fetch existing package data when editing
    const { data: packageData, isLoading: packageLoading, isError: packageError, error: packageErrorInfo, refetch: refetchPackage } = usePackage(id || '', {
        enabled: isEditing,
    });
    const existingPackage = packageData?.data;

    // Mutation hooks
    const createMutation = useCreatePackage({
        onSuccess: () => {
            toast.success('Paket berhasil dibuat');
            navigate('/paket');
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal membuat paket');
        },
    });

    const updateMutation = useUpdatePackage({
        onSuccess: () => {
            toast.success('Paket berhasil diperbarui');
            navigate('/paket');
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal memperbarui paket');
        },
    });

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            code: '',
            name: '',
            type: 'umroh',
            departureDate: '',
            returnDate: '',
            totalSeats: '',
            pricePerPerson: '',
            estimatedCost: '',
            description: '',
            status: 'open',
        },
    });

    // Populate form when editing
    useEffect(() => {
        if (existingPackage) {
            reset({
                code: existingPackage.code || '',
                name: existingPackage.name || '',
                type: existingPackage.type || 'umroh',
                departureDate: existingPackage.departureDate ? formatDateToID(existingPackage.departureDate) : '',
                returnDate: existingPackage.returnDate ? formatDateToID(existingPackage.returnDate) : '',
                totalSeats: existingPackage.totalSeats?.toString() || '',
                pricePerPerson: existingPackage.pricePerPerson?.toString() || '',
                estimatedCost: existingPackage.estimatedCost?.toString() || '',
                description: existingPackage.description || '',
                status: existingPackage.status || 'open',
            });
        }
    }, [existingPackage, reset]);

    const onSubmit = async (data) => {
        // Map form data to API schema
        const payload = {
            code: data.code,
            name: data.name,
            type: data.type,
            departureDate: data.departureDate ? formatDateForAPI(data.departureDate) : undefined,
            returnDate: data.returnDate ? formatDateForAPI(data.returnDate) : undefined,
            totalSeats: parseInt(data.totalSeats) || 0,
            pricePerPerson: data.pricePerPerson || '0',
            estimatedCost: data.estimatedCost || '0',
            description: data.description || undefined,
            status: data.status,
        };

        if (isEditing) {
            updateMutation.mutate({ id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

    // Show error state if fetching failed
    if (isEditing && packageError) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="max-w-md w-full text-center p-8">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Gagal Memuat Paket</h3>
                    <p className="text-gray-400 mb-6">
                        {packageErrorInfo?.message || 'Terjadi kesalahan saat memuat data paket.'}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/paket">
                            <Button variant="secondary">Kembali</Button>
                        </Link>
                        <Button onClick={() => refetchPackage()} icon={<RefreshCw className="w-4 h-4" />}>
                            Coba Lagi
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // Show loading when fetching existing data
    if (isEditing && packageLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-3" />
                    <p className="text-gray-400">Memuat data paket...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header flex items-center gap-4">
                <Link to="/paket">
                    <Button variant="ghost" size="sm" className="!p-2">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="page-title">
                        {isEditing ? 'Edit Paket' : 'Buat Paket Baru'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isEditing ? 'Perbarui informasi paket' : 'Buat paket umrah atau haji baru'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <Card title="Informasi Dasar" subtitle="Detail paket perjalanan">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Kode Paket"
                            placeholder="UMR-2024-03"
                            required
                            icon={<Package className="w-4 h-4" />}
                            error={errors.code?.message}
                            {...register('code', { required: 'Kode paket wajib diisi' })}
                        />
                        <Input
                            label="Nama Paket"
                            placeholder="Umrah Reguler Maret 2024"
                            required
                            icon={<FileText className="w-4 h-4" />}
                            error={errors.name?.message}
                            {...register('name', { required: 'Nama paket wajib diisi' })}
                        />
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Tipe Paket <span className="text-rose-400 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <Plane className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <select
                                    className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 appearance-none"
                                    {...register('type', { required: 'Tipe wajib dipilih' })}
                                >
                                    <option value="umroh">Umrah</option>
                                    <option value="haji">Haji</option>
                                </select>
                            </div>
                        </div>
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Status <span className="text-rose-400 ml-1">*</span>
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 appearance-none"
                                {...register('status')}
                            >
                                <option value="open">Open</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="closed">Closed</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Schedule */}
                <Card title="Jadwal Perjalanan" subtitle="Tanggal keberangkatan dan kepulangan">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Tanggal Berangkat"
                            placeholder="DD/MM/YYYY"
                            required
                            icon={<Calendar className="w-4 h-4" />}
                            error={errors.departureDate?.message}
                            {...register('departureDate', {
                                required: 'Tanggal berangkat wajib diisi',
                                validate: (val) => isValidIDDate(val) || 'Format harus DD/MM/YYYY'
                            })}
                        />
                        <Input
                            label="Tanggal Pulang"
                            placeholder="DD/MM/YYYY"
                            required
                            icon={<Calendar className="w-4 h-4" />}
                            error={errors.returnDate?.message}
                            {...register('returnDate', {
                                required: 'Tanggal pulang wajib diisi',
                                validate: (val) => isValidIDDate(val) || 'Format harus DD/MM/YYYY'
                            })}
                        />
                    </div>
                </Card>

                {/* Quota & Price */}
                <Card title="Kuota & Harga" subtitle="Kapasitas dan biaya paket">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Kuota Jamaah"
                            type="number"
                            placeholder="45"
                            required
                            icon={<Users className="w-4 h-4" />}
                            error={errors.totalSeats?.message}
                            {...register('totalSeats', {
                                required: 'Kuota wajib diisi',
                                min: { value: 1, message: 'Kuota minimal 1' },
                            })}
                        />
                        <Input
                            label="Harga per Jamaah"
                            type="number"
                            placeholder="25000000"
                            required
                            icon={<span className="text-sm font-medium">Rp</span>}
                            error={errors.pricePerPerson?.message}
                            {...register('pricePerPerson', { required: 'Harga wajib diisi' })}
                        />
                        <Input
                            label="Estimasi Biaya (Budget)"
                            type="number"
                            placeholder="15000000"
                            icon={<span className="text-sm font-medium">Rp</span>}
                            error={errors.estimatedCost?.message}
                            {...register('estimatedCost')}
                        />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Deskripsi
                            </label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 resize-none"
                                rows={4}
                                placeholder="Deskripsi paket, fasilitas, hotel, dll..."
                                {...register('description')}
                            />
                        </div>
                    </div>
                </Card>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Link to="/paket">
                        <Button variant="secondary">Batal</Button>
                    </Link>
                    <Button
                        type="submit"
                        loading={isLoading}
                        icon={<Save className="w-4 h-4" />}
                    >
                        {isEditing ? 'Simpan Perubahan' : 'Buat Paket'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PaketForm;
