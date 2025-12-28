import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Building2, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../molecules/Modal';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import { useVendors, useCreateVendorDebt } from '../../hooks/useVendors';
import { usePackages } from '../../hooks/usePackages';

/**
 * AddVendorDebtModal - Modal for adding vendor debt/hutang
 */
const AddVendorDebtModal = ({ isOpen, onClose }) => {
    // Fetch vendors
    const { data: vendorsData, isLoading: vendorsLoading } = useVendors(
        { limit: 100 },
        { enabled: isOpen }
    );
    const vendors = vendorsData?.data || [];

    // Fetch packages
    const { data: packagesData, isLoading: packagesLoading } = usePackages(
        { status: 'open', limit: 100 },
        { enabled: isOpen }
    );
    const packages = packagesData?.data || [];

    // Create debt mutation
    const createMutation = useCreateVendorDebt({
        onSuccess: () => {
            toast.success('Hutang vendor berhasil ditambahkan');
            reset();
            onClose();
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal menambahkan hutang vendor');
        },
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            vendorId: '',
            packageId: '',
            description: '',
            totalAmount: '',
            paidAmount: '0',
            dueDate: '',
            notes: '',
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
            vendorId: data.vendorId,
            packageId: data.packageId || undefined,
            description: data.description,
            totalAmount: data.totalAmount, // Backend handles string/number transformation
            paidAmount: data.paidAmount || '0',
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
            notes: data.notes || undefined,
        };

        createMutation.mutate(payload);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tambah Hutang Vendor"
            subtitle="Catat hutang baru ke vendor"
            size="lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Vendor Selection */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Vendor <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                            {vendorsLoading ? (
                                <div className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                    <span className="text-gray-500">Memuat...</span>
                                </div>
                            ) : (
                                <select
                                    className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 appearance-none"
                                    {...register('vendorId', { required: 'Vendor wajib dipilih' })}
                                >
                                    <option value="">Pilih Vendor</option>
                                    {vendors.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.name} ({v.type})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        {errors.vendorId && (
                            <p className="mt-1.5 text-sm text-rose-400">{errors.vendorId.message}</p>
                        )}
                    </div>

                    {/* Package Selection */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Paket (Opsional)
                        </label>
                        <div className="relative">
                            {packagesLoading ? (
                                <div className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/50 border border-surface-border flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                    <span className="text-gray-500">Memuat...</span>
                                </div>
                            ) : (
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 appearance-none"
                                    {...register('packageId')}
                                >
                                    <option value="">Pilih Paket (opsional)</option>
                                    {packages.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.code})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <Input
                            label="Deskripsi"
                            placeholder="Pembayaran tiket pesawat..."
                            required
                            icon={<FileText className="w-4 h-4" />}
                            error={errors.description?.message}
                            {...register('description', { required: 'Deskripsi wajib diisi' })}
                        />
                    </div>

                    {/* Total Amount */}
                    <Input
                        label="Total Hutang"
                        type="number"
                        placeholder="10000000"
                        required
                        icon={<span className="text-sm font-medium">Rp</span>}
                        error={errors.totalAmount?.message}
                        {...register('totalAmount', { required: 'Total hutang wajib diisi' })}
                    />

                    {/* Paid Amount */}
                    <Input
                        label="Sudah Dibayar"
                        type="number"
                        placeholder="0"
                        icon={<span className="text-sm font-medium">Rp</span>}
                        {...register('paidAmount')}
                    />

                    {/* Due Date */}
                    <Input
                        label="Jatuh Tempo"
                        type="date"
                        icon={<Calendar className="w-4 h-4" />}
                        {...register('dueDate')}
                    />

                    {/* Notes */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Catatan
                        </label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 resize-none"
                            rows={3}
                            placeholder="Catatan tambahan..."
                            {...register('notes')}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                    <Button variant="secondary" onClick={onClose} type="button">
                        Batal
                    </Button>
                    <Button type="submit" loading={createMutation.isPending}>
                        Simpan Hutang
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddVendorDebtModal;
