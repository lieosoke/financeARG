import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Building2, Package, FileText, Loader2, Upload, CreditCard, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../molecules/Modal';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import { useUpdateTransaction, transactionKeys } from '../../hooks/useTransactions';
import { formatDateToID, formatDateForAPI, isValidIDDate } from '../../utils/dateUtils';
import { useQueryClient } from '@tanstack/react-query';

const EditExpenseModal = ({ isOpen, onClose, initialData }) => {
    const queryClient = useQueryClient();

    const updateMutation = useUpdateTransaction({
        onSuccess: () => {
            toast.success('Pengeluaran berhasil diperbarui');
            queryClient.invalidateQueries(transactionKeys.all);
            onClose();
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal memperbarui pengeluaran');
        },
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            amount: '',
            expenseCategory: 'lainnya',
            paymentMethod: 'cash',
            transactionDate: '',
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

        const validTypes = ['image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setPhotoError('Hanya file JPEG/JPG yang diperbolehkan');
            e.target.value = '';
            return;
        }

        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            setPhotoError('Ukuran file maksimal 2MB');
            e.target.value = '';
            return;
        }

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

    const handleRemovePhoto = () => {
        setPhotoPreview(null);
        setPhotoFile(null);
        setPhotoError('');
        const fileInput = document.getElementById('edit-payment-proof-upload');
        if (fileInput) fileInput.value = '';
    };

    useEffect(() => {
        if (isOpen && initialData) {
            reset({
                amount: initialData.amount,
                expenseCategory: initialData.expenseCategory || 'lainnya',
                paymentMethod: initialData.paymentMethod || 'cash',
                transactionDate: initialData.transactionDate ? formatDateToID(initialData.transactionDate) : '',
                description: initialData.description || initialData.notes || '',
            });
            // Set existing photo if available
            if (initialData.receiptUrl) {
                setPhotoPreview(initialData.receiptUrl);
                setPhotoFile(initialData.receiptUrl);
            } else {
                setPhotoPreview(null);
                setPhotoFile(null);
            }
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = (data) => {
        const payload = {
            amount: data.amount,
            expenseCategory: data.expenseCategory,
            paymentMethod: data.paymentMethod,
            transactionDate: formatDateForAPI(data.transactionDate),
            description: data.description || undefined,
            receiptUrl: photoFile || undefined,
        };

        updateMutation.mutate({ id: initialData.id, data: payload });
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
            title="Edit Pengeluaran"
            subtitle="Perbarui data transaksi pengeluaran"
            size="lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Read Only Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-dark-tertiary/30 p-4 rounded-xl border border-surface-border">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Vendor</label>
                        <p className="text-white font-medium">{initialData?.vendorName || initialData?.vendor?.name || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Paket</label>
                        <p className="text-white font-medium">{initialData?.packageName || initialData?.package?.name || '-'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amount */}
                    <Input
                        label="Jumlah Pengeluaran"
                        type="number"
                        required
                        icon={<span className="text-sm font-medium">Rp</span>}
                        error={errors.amount?.message}
                        {...register('amount', {
                            required: 'Jumlah wajib diisi',
                            min: { value: 1, message: 'Jumlah minimal 1' },
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
                                        id="edit-payment-proof-upload"
                                        accept="image/jpeg,image/jpg"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="edit-payment-proof-upload"
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
                                placeholder="Catatan atau keterangan tambahan..."
                                {...register('description')}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-surface-border">
                    <Button variant="secondary" onClick={onClose} type="button" className="w-full sm:w-auto">
                        Batal
                    </Button>
                    <Button type="submit" loading={updateMutation.isPending} className="w-full sm:w-auto">
                        Simpan Perubahan
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditExpenseModal;
