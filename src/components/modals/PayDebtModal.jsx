import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Building2, FileText, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../molecules/Modal';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import { usePayVendorDebt, useVendorDebts } from '../../hooks/useVendors';
import { formatCurrency } from '../../utils/formatters';

/**
 * PayDebtModal - Modal for recording vendor debt payment
 */
const PayDebtModal = ({ isOpen, onClose, debt }) => {
    const [selectedDebt, setSelectedDebt] = useState(debt);
    const [searchQuery, setSearchQuery] = useState('');

    // Update selected debt when prop changes
    useEffect(() => {
        if (isOpen && debt) {
            setSelectedDebt(debt);
        } else if (isOpen && !debt) {
            setSelectedDebt(null);
        }
    }, [debt, isOpen]);

    // Fetch outstanding debts for selection
    const { data: debtsData, isLoading: isLoadingDebts } = useVendorDebts(
        { limit: 100 },
        { enabled: isOpen && !selectedDebt }
    );

    const outstandingDebts = (debtsData?.data || [])
        .filter(d => d.status !== 'paid')
        .filter(d => {
            if (!searchQuery) return true;
            return d.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.description?.toLowerCase().includes(searchQuery.toLowerCase());
        });

    const activeDebt = selectedDebt;

    // Calculate values for active debt
    const totalAmount = activeDebt ? (parseFloat(activeDebt.totalAmount) || 0) : 0;
    const paidAmount = activeDebt ? (parseFloat(activeDebt.paidAmount) || 0) : 0;
    const remaining = totalAmount - paidAmount;

    // Pay debt mutation
    const payMutation = usePayVendorDebt({
        onSuccess: () => {
            toast.success('Pembayaran berhasil dicatat');
            reset();
            onClose();
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal mencatat pembayaran');
        },
    });

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        defaultValues: {
            amount: '',
            notes: '',
        },
    });

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            reset();
            setSearchQuery('');
        }
    }, [isOpen, reset]);

    const onSubmit = async (data) => {
        if (!activeDebt) return;

        const amount = parseFloat(data.amount);

        if (amount <= 0) {
            toast.error('Jumlah pembayaran harus lebih dari 0');
            return;
        }

        if (amount > remaining) {
            toast.error(`Jumlah pembayaran tidak boleh melebihi sisa hutang (${formatCurrency(remaining)})`);
            return;
        }

        payMutation.mutate({
            id: activeDebt.id,
            amount: amount,
        });
    };

    const handlePayFull = () => {
        setValue('amount', remaining.toString());
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Catat Pembayaran"
            subtitle="Catat pembayaran hutang vendor"
            size="md"
        >
            {!activeDebt ? (
                // Selection Mode
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Cari hutang / vendor..."
                            className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
                        {isLoadingDebts ? (
                            <div className="text-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-3" />
                                <p className="text-gray-400">Memuat data hutang...</p>
                            </div>
                        ) : outstandingDebts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Tidak ada hutang outstanding
                            </div>
                        ) : (
                            outstandingDebts.map(d => {
                                const dTotal = parseFloat(d.totalAmount) || 0;
                                const dPaid = parseFloat(d.paidAmount) || 0;
                                const dRemaining = dTotal - dPaid;

                                return (
                                    <div
                                        key={d.id}
                                        onClick={() => setSelectedDebt(d)}
                                        className="p-3 rounded-xl bg-dark-tertiary/30 border border-surface-border hover:bg-surface-glass cursor-pointer transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium text-white">{d.vendor?.name}</h4>
                                                <p className="text-xs text-gray-500">{d.description}</p>
                                            </div>
                                            <span className="text-xs font-medium text-amber-400">
                                                Sisa: {formatCurrency(dRemaining)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Total: {formatCurrency(dTotal)}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            ) : (
                // Payment Form Mode
                <>
                    {/* Debt Info Summary */}
                    <div className="bg-dark-tertiary/50 rounded-xl p-4 mb-6 border border-surface-border">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-surface-glass rounded-xl flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{activeDebt.vendor?.name || 'Vendor'}</h3>
                                    <p className="text-xs text-gray-500">{activeDebt.description || '-'}</p>
                                </div>
                            </div>
                            {!debt && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedDebt(null)}
                                    className="text-xs"
                                >
                                    Ganti
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xs text-gray-500">Total Hutang</p>
                                <p className="text-sm font-semibold text-white">{formatCurrency(totalAmount)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Sudah Dibayar</p>
                                <p className="text-sm font-semibold text-emerald-400">{formatCurrency(paidAmount)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Sisa</p>
                                <p className="text-sm font-semibold text-amber-400">{formatCurrency(remaining)}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Amount */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Jumlah Pembayaran <span className="text-rose-400">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handlePayFull}
                                    className="text-xs text-primary-400 hover:text-primary-300 font-medium"
                                >
                                    Bayar Lunas
                                </button>
                            </div>
                            <Input
                                type="number"
                                placeholder="1000000"
                                required
                                icon={<span className="text-sm font-medium">Rp</span>}
                                error={errors.amount?.message}
                                {...register('amount', {
                                    required: 'Jumlah wajib diisi',
                                    min: { value: 1, message: 'Jumlah minimal 1' },
                                })}
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Catatan
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                                <textarea
                                    className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 resize-none"
                                    rows={3}
                                    placeholder="Catatan pembayaran..."
                                    {...register('notes')}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                            <Button variant="secondary" onClick={onClose} type="button">
                                Batal
                            </Button>
                            <Button type="submit" loading={payMutation.isPending}>
                                Simpan Pembayaran
                            </Button>
                        </div>
                    </form>
                </>
            )}
        </Modal>
    );
};

export default PayDebtModal;
