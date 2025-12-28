import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, User, Package, FileText, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../molecules/Modal';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import { useJamaahList } from '../../hooks/useJamaah';
import { usePackages } from '../../hooks/usePackages';
import { useCreateIncome, transactionKeys } from '../../hooks/useTransactions';
import { formatDateToID, parseDateFromID, formatDateForAPI, isValidIDDate } from '../../utils/dateUtils';
import { useQueryClient } from '@tanstack/react-query';

/**
 * AddIncomeModal - Modal for adding income transactions
 */
const AddIncomeModal = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();

    // Fetch jamaah list - removed isActive filter as some jamaah may not have this flag set
    const { data: jamaahData, isLoading: jamaahLoading, isError: jamaahError, refetch: refetchJamaah } = useJamaahList(
        { limit: 200 },
        { enabled: isOpen }
    );
    const jamaahList = jamaahData?.data || [];

    // Fetch packages
    const { data: packagesData, isLoading: packagesLoading, isError: packagesError, refetch: refetchPackages } = usePackages(
        { status: 'open', limit: 100 },
        { enabled: isOpen }
    );
    const packages = packagesData?.data || [];

    // Create income mutation
    const createMutation = useCreateIncome({
        onSuccess: () => {
            toast.success('Pemasukan berhasil ditambahkan');
            queryClient.invalidateQueries(transactionKeys.all);
            reset();
            onClose();
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal menambahkan pemasukan');
        },
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            jamaahId: '',
            packageId: '',
            amount: '',
            incomeCategory: 'dp',
            transactionDate: formatDateToID(new Date()),
            description: '',
        },
    });

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    const onSubmit = async (data) => {
        const payload = {
            jamaahId: data.jamaahId || undefined,
            packageId: data.packageId || undefined,
            amount: data.amount,
            incomeCategory: data.incomeCategory,
            transactionDate: formatDateForAPI(data.transactionDate),
            description: data.description || undefined,
        };

        createMutation.mutate(payload);
    };

    const categoryOptions = [
        { value: 'dp', label: 'DP (Down Payment)' },
        { value: 'cicilan', label: 'Cicilan' },
        { value: 'pelunasan', label: 'Pelunasan' },
        { value: 'lainnya', label: 'Lainnya' },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tambah Pemasukan"
            subtitle="Catat transaksi pemasukan baru"
            size="lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Jamaah Selection */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Jamaah
                        </label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                            {jamaahLoading ? (
                                <div className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                    <span className="text-gray-500">Memuat...</span>
                                </div>
                            ) : jamaahError ? (
                                <div className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-rose-500/50 flex items-center justify-between gap-2 text-rose-400">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm">Gagal memuat jamaah</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => refetchJamaah()}
                                        className="text-xs underline hover:text-rose-300"
                                    >
                                        Coba lagi
                                    </button>
                                </div>
                            ) : (
                                <select
                                    className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 appearance-none"
                                    {...register('jamaahId')}
                                >
                                    <option value="">Pilih Jamaah (opsional)</option>
                                    {jamaahList.length === 0 ? (
                                        <option value="" disabled>Tidak ada jamaah tersedia</option>
                                    ) : (
                                        jamaahList.map((j) => (
                                            <option key={j.id} value={j.id}>
                                                {j.name} - {j.phone || '-'}
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
                            {...register('incomeCategory', { required: 'Kategori wajib dipilih' })}
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
                        Simpan Pemasukan
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddIncomeModal;
