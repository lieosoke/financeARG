import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Building2, Package, FileText, Loader2, AlertCircle, RefreshCw, Upload, CreditCard, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../molecules/Modal';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import { useVendors } from '../../hooks/useVendors';
import { usePackages } from '../../hooks/usePackages';
import { useCreateExpense, transactionKeys } from '../../hooks/useTransactions';
import { formatDateToID, parseDateFromID, formatDateForAPI, isValidIDDate } from '../../utils/dateUtils';
import { useQueryClient } from '@tanstack/react-query';

/**
 * AddExpenseModal - Modal for adding expense transactions
 */
const AddExpenseModal = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();

    // Fetch vendors
    const { data: vendorsData, isLoading: vendorsLoading, isError: vendorsError, refetch: refetchVendors } = useVendors(
        { limit: 200 },
        { enabled: isOpen }
    );
    const vendorList = vendorsData?.data || [];

    // Fetch packages
    const { data: packagesData, isLoading: packagesLoading, isError: packagesError, refetch: refetchPackages } = usePackages(
        { limit: 100 },
        { enabled: isOpen }
    );
    const packages = packagesData?.data || [];

    // Create expense mutation
    const createMutation = useCreateExpense({
        onSuccess: () => {
            toast.success('Pengeluaran berhasil ditambahkan');
            queryClient.invalidateQueries(transactionKeys.all);
            reset();
            onClose();
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal menambahkan pengeluaran');
        },
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            vendorId: '',
            packageId: '',
            amount: '',
            expenseCategory: 'lainnya',
            paymentMethod: 'cash',
            transactionDate: formatDateToID(new Date()),
            description: '',
        },
    });

    // Photo upload state
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoError, setPhotoError] = useState('');

    // Handle photo upload
    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPhotoError('');

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setPhotoError('Hanya file JPEG/JPG yang diperbolehkan');
            e.target.value = '';
            return;
        }

        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            setPhotoError('Ukuran file maksimal 2MB');
            e.target.value = '';
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result);
            setPhotoFile(reader.result);
        };
        reader.onerror = () => {
            setPhotoError('Gagal membaca file');
        };
        reader.readAsDataURL(file);
    };

    // Remove photo
    const handleRemovePhoto = () => {
        setPhotoPreview(null);
        setPhotoFile(null);
        setPhotoError('');
        const fileInput = document.getElementById('payment-proof-upload');
        if (fileInput) fileInput.value = '';
    };

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            reset();
            handleRemovePhoto();
        }
    }, [isOpen, reset]);

    const onSubmit = async (data) => {
        const payload = {
            vendorId: data.vendorId || undefined,
            packageId: data.packageId || undefined,
            amount: data.amount,
            expenseCategory: data.expenseCategory,
            paymentMethod: data.paymentMethod,
            transactionDate: formatDateForAPI(data.transactionDate),
            description: data.description || undefined,
            receiptUrl: photoFile || undefined,
        };

        createMutation.mutate(payload);
    };

    const categoryOptions = [
        { value: 'tiket_pesawat', label: 'Tiket Pesawat' },
        { value: 'hotel', label: 'Hotel' },
        { value: 'hotel_transit', label: 'Hotel Transit' },
        { value: 'transport', label: 'Transport' },
        { value: 'visa', label: 'Visa' },
        { value: 'handling', label: 'Handling' },
        { value: 'muthawif', label: 'Muthawif' },
        { value: 'konsumsi', label: 'Konsumsi' },
        { value: 'manasik', label: 'Manasik' },
        { value: 'ujroh', label: 'Ujroh' },
        { value: 'lainnya', label: 'Lainnya' },
    ];

    const paymentMethodOptions = [
        { value: 'cash', label: 'Cash' },
        { value: 'transfer', label: 'Transfer' },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tambah Pengeluaran"
            subtitle="Catat transaksi pengeluaran baru"
            size="lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Vendor Selection */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Vendor
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                            {vendorsLoading ? (
                                <div className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                    <span className="text-gray-500">Memuat...</span>
                                </div>
                            ) : vendorsError ? (
                                <div className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-rose-500/50 flex items-center justify-between gap-2 text-rose-400">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm">Gagal memuat vendor</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => refetchVendors()}
                                        className="text-xs underline hover:text-rose-300"
                                    >
                                        Coba lagi
                                    </button>
                                </div>
                            ) : (
                                <select
                                    className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 appearance-none"
                                    {...register('vendorId')}
                                >
                                    <option value="">Pilih Vendor (opsional)</option>
                                    {vendorList.length === 0 ? (
                                        <option value="" disabled>Tidak ada vendor tersedia</option>
                                    ) : (
                                        vendorList.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.name} - {v.type || 'Umum'}
                                            </option>
                                        ))
                                    )}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Package Selection */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Paket
                        </label>
                        <div className="relative">
                            <Package className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                            {packagesLoading ? (
                                <div className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                    <span className="text-gray-500">Memuat...</span>
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
                                    {...register('packageId')}
                                >
                                    <option value="">Pilih Paket (opsional)</option>
                                    {packages.length === 0 ? (
                                        <option value="" disabled>Tidak ada paket tersedia</option>
                                    ) : (
                                        packages.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({p.code})
                                            </option>
                                        ))
                                    )}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Amount */}
                    <Input
                        label="Jumlah"
                        type="number"
                        placeholder="1000000"
                        required
                        icon={<span className="text-sm font-medium">Rp</span>}
                        error={errors.amount?.message}
                        {...register('amount', {
                            required: 'Jumlah wajib diisi',
                            min: { value: 1, message: 'Jumlah minimal 1' },
                            pattern: { value: /^\d+$/, message: 'Harus berupa angka (tanpa desimal)' }
                        })}
                    />

                    {/* Category */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Kategori <span className="text-rose-400">*</span>
                        </label>
                        <select
                            className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 appearance-none"
                            {...register('expenseCategory', { required: 'Kategori wajib dipilih' })}
                        >
                            {categoryOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <Input
                        label="Tanggal"
                        placeholder="DD/MM/YYYY"
                        required
                        icon={<Calendar className="w-4 h-4" />}
                        error={errors.transactionDate?.message}
                        {...register('transactionDate', {
                            required: 'Tanggal wajib diisi',
                            validate: (val) => isValidIDDate(val) || 'Format harus DD/MM/YYYY'
                        })}
                    />

                    {/* Payment Method */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Metode Pembayaran <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                            <CreditCard className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <select
                                className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 appearance-none"
                                {...register('paymentMethod', { required: 'Metode pembayaran wajib dipilih' })}
                            >
                                {paymentMethodOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.paymentMethod && (
                            <p className="mt-1 text-sm text-rose-400">{errors.paymentMethod.message}</p>
                        )}
                    </div>

                    {/* Payment Proof Photo Upload */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Bukti Pembayaran (Foto)
                        </label>
                        <div className="space-y-3">
                            {!photoPreview ? (
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="payment-proof-upload"
                                        accept="image/jpeg,image/jpg"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="payment-proof-upload"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-6 rounded-xl bg-dark-tertiary/50 border-2 border-dashed border-surface-border text-gray-400 hover:border-primary-500/50 hover:text-primary-400 cursor-pointer transition-all duration-200"
                                    >
                                        <Upload className="w-5 h-5" />
                                        <div className="text-center">
                                            <p className="text-sm font-medium">Klik untuk upload foto</p>
                                            <p className="text-xs text-gray-500 mt-1">JPEG/JPG, maks. 2MB</p>
                                        </div>
                                    </label>
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden border border-surface-border bg-dark-tertiary/30">
                                    <img
                                        src={photoPreview}
                                        alt="Bukti Pembayaran"
                                        className="w-full h-auto max-h-64 object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="absolute top-2 right-2 p-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-colors duration-200"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                        <div className="flex items-center gap-2 text-white text-sm">
                                            <ImageIcon className="w-4 h-4" />
                                            <span>Bukti Pembayaran</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {photoError && (
                                <div className="flex items-center gap-2 text-rose-400 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{photoError}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Keterangan
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                            <textarea
                                className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 resize-none"
                                rows={3}
                                placeholder="Keterangan tambahan..."
                                {...register('description')}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                    <Button variant="secondary" onClick={onClose} type="button">
                        Batal
                    </Button>
                    <Button type="submit" loading={createMutation.isPending}>
                        Simpan Pengeluaran
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddExpenseModal;
