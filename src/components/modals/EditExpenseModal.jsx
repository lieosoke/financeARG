import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Building2, Package, FileText, Loader2 } from 'lucide-react';
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
            transactionDate: '',
            description: '',
        },
    });

    useEffect(() => {
        if (isOpen && initialData) {
            reset({
                amount: initialData.amount,
                expenseCategory: initialData.expenseCategory || 'lainnya',
                transactionDate: initialData.transactionDate ? formatDateToID(initialData.transactionDate) : '',
                description: initialData.description || initialData.notes || '',
            });
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = (data) => {
        const payload = {
            amount: data.amount,
            expenseCategory: data.expenseCategory,
            transactionDate: formatDateForAPI(data.transactionDate),
            description: data.description || undefined,
        };

        updateMutation.mutate({ id: initialData.id, data: payload });
    };

    const categoryOptions = [
        { value: 'tiket_pesawat', label: 'Tiket Pesawat' },
        { value: 'hotel', label: 'Hotel' },
        { value: 'transport', label: 'Transport' },
        { value: 'visa', label: 'Visa' },
        { value: 'handling', label: 'Handling' },
        { value: 'muthawif', label: 'Muthawif' },
        { value: 'konsumsi', label: 'Konsumsi' },
        { value: 'lainnya', label: 'Lainnya' },
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
