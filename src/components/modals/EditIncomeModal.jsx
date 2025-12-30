import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, User, Package, FileText, Loader2, AlertCircle, Wallet, CreditCard, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../molecules/Modal';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import { useJamaahList } from '../../hooks/useJamaah';
import { usePackages } from '../../hooks/usePackages';
import { useUpdateTransaction, transactionKeys } from '../../hooks/useTransactions'; // Assuming update hook exists or I'll create it
import { formatDateToID, formatDateForAPI, isValidIDDate } from '../../utils/dateUtils';
import { useQueryClient } from '@tanstack/react-query';

const EditIncomeModal = ({ isOpen, onClose, initialData }) => {
    const queryClient = useQueryClient();

    // Fetch jamaah list for reference (though often we don't change jamaah on edit to avoid complex balance issues, but let's allow it if needed or just show as readonly)
    // For safety, let's keep Jamaah and Package READONLY for now in Edit, to prevent messing up the linkage logic which is complex.
    // Allow editing: Amount, Date, Method, Description, Category.

    const updateMutation = useUpdateTransaction({
        onSuccess: () => {
            toast.success('Pemasukan berhasil diperbarui');
            queryClient.invalidateQueries(transactionKeys.all);
            onClose();
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal memperbarui pemasukan');
        },
    });

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            amount: '',
            discount: '',
            incomeCategory: 'dp',
            paymentMethod: 'cash',
            referenceNumber: '',
            transactionDate: '',
            description: '',
        },
    });

    const watchedPaymentMethod = watch('paymentMethod');

    useEffect(() => {
        if (isOpen && initialData) {
            reset({
                amount: initialData.amount,
                discount: initialData.discount || '0',
                incomeCategory: initialData.incomeCategory,
                paymentMethod: initialData.paymentMethod,
                referenceNumber: initialData.referenceNumber || '',
                transactionDate: initialData.transactionDate ? formatDateToID(initialData.transactionDate) : '',
                description: initialData.description || '',
            });
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = (data) => {
        const payload = {
            amount: data.amount,
            discount: data.discount || '0',
            incomeCategory: data.incomeCategory,
            paymentMethod: data.paymentMethod,
            referenceNumber: data.paymentMethod === 'transfer' ? data.referenceNumber : undefined,
            transactionDate: formatDateForAPI(data.transactionDate),
            description: data.description || undefined,
        };

        updateMutation.mutate({ id: initialData.id, data: payload });
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
            title="Edit Pemasukan"
            subtitle="Perbarui data transaksi pemasukan"
            size="lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Read Only Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-dark-tertiary/30 p-4 rounded-xl border border-surface-border">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Jamaah</label>
                        <p className="text-white font-medium">{initialData?.jamaah?.name || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Paket</label>
                        <p className="text-white font-medium">{initialData?.package?.packageName || initialData?.package?.name || '-'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amount */}
                    <Input
                        label="Jumlah Pembayaran"
                        type="number"
                        required
                        icon={<span className="text-sm font-medium">Rp</span>}
                        error={errors.amount?.message}
                        {...register('amount', {
                            required: 'Jumlah wajib diisi',
                            min: { value: 1, message: 'Jumlah minimal 1' },
                        })}
                    />

                    {/* Discount */}
                    <Input
                        label="Diskon"
                        type="number"
                        placeholder="0"
                        icon={<span className="text-sm font-medium">Rp</span>}
                        helper="Opsional - potongan harga"
                        error={errors.discount?.message}
                        {...register('discount', {
                            min: { value: 0, message: 'Diskon tidak boleh negatif' },
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

                    {/* Payment Method */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Metode Pembayaran <span className="text-rose-400">*</span>
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setValue('paymentMethod', 'cash')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${watchedPaymentMethod === 'cash'
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                    : 'border-surface-border text-gray-400 hover:bg-surface-glass hover:border-gray-500'
                                    }`}
                            >
                                <Wallet className="w-5 h-5" />
                                <span className="font-medium">Cash</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setValue('paymentMethod', 'transfer')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${watchedPaymentMethod === 'transfer'
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                    : 'border-surface-border text-gray-400 hover:bg-surface-glass hover:border-gray-500'
                                    }`}
                            >
                                <CreditCard className="w-5 h-5" />
                                <span className="font-medium">Transfer</span>
                            </button>
                        </div>
                    </div>

                    {/* Reference Number */}
                    {watchedPaymentMethod === 'transfer' && (
                        <div className="md:col-span-2">
                            <Input
                                label="Nomor Referensi Transfer"
                                placeholder="Nomor bukti transfer / rekening pengirim"
                                icon={<CreditCard className="w-4 h-4" />}
                                {...register('referenceNumber')}
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Keterangan
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                            <textarea
                                className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 resize-none"
                                rows={2}
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

export default EditIncomeModal;
