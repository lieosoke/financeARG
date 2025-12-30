import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, User, Package, FileText, Loader2, AlertCircle, RefreshCw, Wallet, Info, CreditCard, Upload, X, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../molecules/Modal';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import { useJamaahList } from '../../hooks/useJamaah';
import { usePackages } from '../../hooks/usePackages';
import { useCreateIncome, transactionKeys } from '../../hooks/useTransactions';
import { formatDateToID, parseDateFromID, formatDateForAPI, isValidIDDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { useQueryClient } from '@tanstack/react-query';

/**
 * AddIncomeModal - Modal for adding income transactions
 * Features:
 * - Jamaah & Package selection (required)
 * - Shows jamaah's payment info (total, paid, remaining)
 * - Discount field with auto-calculation
 * - Payment summary with remaining balance context
 */
const AddIncomeModal = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();

    // Fetch jamaah list
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

    // File upload ref and state
    const fileInputRef = useRef(null);
    const [paymentProof, setPaymentProof] = useState(null); // { file, preview }

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            jamaahId: '',
            packageId: '',
            amount: '',
            discount: '',
            incomeCategory: 'dp',
            paymentMethod: 'cash',
            referenceNumber: '',
            transactionDate: formatDateToID(new Date()),
            description: '',
        },
    });

    // Watch form values
    const watchedJamaahId = watch('jamaahId');
    const watchedPackageId = watch('packageId');
    const watchedAmount = watch('amount');
    const watchedDiscount = watch('discount');
    const watchedPaymentMethod = watch('paymentMethod');
    const watchedCategory = watch('incomeCategory');

    // Get selected jamaah info
    const selectedJamaah = useMemo(() => {
        if (!watchedJamaahId) return null;
        return jamaahList.find(j => j.id === watchedJamaahId) || null;
    }, [watchedJamaahId, jamaahList]);

    // Get selected package info
    const selectedPackage = useMemo(() => {
        if (!watchedPackageId) return null;
        return packages.find(p => p.id === watchedPackageId) || null;
    }, [watchedPackageId, packages]);

    // Calculate jamaah payment info
    const jamaahPaymentInfo = useMemo(() => {
        if (!selectedJamaah) return null;
        return {
            totalAmount: parseFloat(selectedJamaah.totalAmount) || 0,
            paidAmount: parseFloat(selectedJamaah.paidAmount) || 0,
            remainingAmount: parseFloat(selectedJamaah.remainingAmount) || 0,
            packageName: selectedJamaah.package?.packageName || selectedJamaah.package?.name || 'Belum ada paket',
            status: selectedJamaah.paymentStatus,
        };
    }, [selectedJamaah]);

    // Calculate amounts
    const grossAmount = parseFloat(watchedAmount) || 0;
    const discount = parseFloat(watchedDiscount) || 0;
    const netAmount = Math.max(0, grossAmount - discount);

    // Calculate remaining after this payment (discount reduces debt, so use grossAmount)
    const remainingAfterPayment = jamaahPaymentInfo
        ? Math.max(0, jamaahPaymentInfo.remainingAmount - grossAmount)
        : 0;

    // Auto-set package when jamaah is selected (if jamaah has package)
    useEffect(() => {
        if (selectedJamaah?.packageId && !watchedPackageId) {
            setValue('packageId', selectedJamaah.packageId);
        }
    }, [selectedJamaah, watchedPackageId, setValue]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            reset();
            setPaymentProof(null);
        }
    }, [isOpen, reset]);

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('File harus berupa gambar (JPG, PNG, dll)');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Ukuran file maksimal 5MB');
                return;
            }
            // Create preview URL
            const preview = URL.createObjectURL(file);
            setPaymentProof({ file, preview });
        }
    };

    // Remove selected file
    const handleRemoveFile = () => {
        if (paymentProof?.preview) {
            URL.revokeObjectURL(paymentProof.preview);
        }
        setPaymentProof(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const onSubmit = async (data) => {
        // Convert payment proof to base64 if exists
        let receiptUrl = undefined;
        if (paymentProof?.file) {
            try {
                receiptUrl = await fileToBase64(paymentProof.file);
            } catch (error) {
                console.error('Failed to convert file:', error);
                toast.error('Gagal memproses file bukti pembayaran');
                return;
            }
        }

        const payload = {
            jamaahId: data.jamaahId,
            packageId: data.packageId,
            amount: data.amount,
            discount: data.discount || '0',
            incomeCategory: data.incomeCategory,
            paymentMethod: data.paymentMethod,
            referenceNumber: data.paymentMethod === 'transfer' ? data.referenceNumber : undefined,
            transactionDate: formatDateForAPI(data.transactionDate),
            description: data.description || undefined,
            receiptUrl,
        };

        createMutation.mutate(payload);
    };

    const categoryOptions = [
        { value: 'dp', label: 'DP (Down Payment)' },
        { value: 'cicilan', label: 'Cicilan' },
        { value: 'pelunasan', label: 'Pelunasan' },
        { value: 'lainnya', label: 'Lainnya' },
    ];

    const getStatusLabel = (status) => {
        const labels = {
            lunas: 'Lunas',
            pending: 'Belum Bayar',
            dp: 'DP',
            cicilan: 'Cicilan',
        };
        return labels[status] || status || 'Belum Bayar';
    };

    const getStatusColor = (status) => {
        const colors = {
            lunas: 'text-emerald-400',
            pending: 'text-amber-400',
            dp: 'text-blue-400',
            cicilan: 'text-purple-400',
        };
        return colors[status] || 'text-gray-400';
    };

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
                    {/* Jamaah Selection - REQUIRED */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Jamaah <span className="text-rose-400">*</span>
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
                                    className={`w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border ${errors.jamaahId ? 'border-rose-500' : 'border-surface-border'} text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 appearance-none`}
                                    {...register('jamaahId', { required: 'Jamaah wajib dipilih' })}
                                >
                                    <option value="">Pilih Jamaah</option>
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
                        {errors.jamaahId && (
                            <p className="text-rose-400 text-xs mt-1">{errors.jamaahId.message}</p>
                        )}
                    </div>

                    {/* Package Selection - REQUIRED */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Paket <span className="text-rose-400">*</span>
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
                                    className={`w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border ${errors.packageId ? 'border-rose-500' : 'border-surface-border'} text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 appearance-none`}
                                    {...register('packageId', { required: 'Paket wajib dipilih' })}
                                >
                                    <option value="">Pilih Paket</option>
                                    {packages.length === 0 ? (
                                        <option value="" disabled>Tidak ada paket tersedia</option>
                                    ) : (
                                        packages.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({p.code}) - {formatCurrency(parseFloat(p.pricePerPerson) || 0)}
                                            </option>
                                        ))
                                    )}
                                </select>
                            )}
                        </div>
                        {errors.packageId && (
                            <p className="text-rose-400 text-xs mt-1">{errors.packageId.message}</p>
                        )}
                    </div>

                    {/* Jamaah Payment Info Card - Show when jamaah selected */}
                    {jamaahPaymentInfo && (
                        <div className="md:col-span-2 bg-gradient-to-r from-primary-500/10 to-blue-500/10 rounded-xl p-4 border border-primary-500/20">
                            <div className="flex items-center gap-2 mb-3">
                                <Wallet className="w-4 h-4 text-primary-400" />
                                <h4 className="text-sm font-medium text-white">Info Pembayaran Jamaah</h4>
                                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full bg-dark-tertiary ${getStatusColor(jamaahPaymentInfo.status)}`}>
                                    {getStatusLabel(jamaahPaymentInfo.status)}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Harga Paket</p>
                                    <p className="text-sm font-semibold text-white">{formatCurrency(jamaahPaymentInfo.totalAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Sudah Dibayar</p>
                                    <p className="text-sm font-semibold text-emerald-400">{formatCurrency(jamaahPaymentInfo.paidAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Sisa Pembayaran</p>
                                    <p className={`text-sm font-semibold ${jamaahPaymentInfo.remainingAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {formatCurrency(jamaahPaymentInfo.remainingAmount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Amount */}
                    <Input
                        label="Jumlah Pembayaran"
                        type="number"
                        placeholder={jamaahPaymentInfo ? String(Math.round(jamaahPaymentInfo.remainingAmount)) : "1000000"}
                        required
                        icon={<span className="text-sm font-medium">Rp</span>}
                        error={errors.amount?.message}
                        helper={jamaahPaymentInfo && jamaahPaymentInfo.remainingAmount > 0
                            ? `Sisa: ${formatCurrency(jamaahPaymentInfo.remainingAmount)}`
                            : undefined}
                        {...register('amount', {
                            required: 'Jumlah wajib diisi',
                            min: { value: 1, message: 'Jumlah minimal 1' },
                            pattern: { value: /^\d+$/, message: 'Harus berupa angka (tanpa desimal)' }
                        })}
                    />

                    {/* Discount - OPTIONAL */}
                    <Input
                        label="Diskon"
                        type="number"
                        placeholder="0"
                        icon={<span className="text-sm font-medium">Rp</span>}
                        helper="Opsional - potongan harga"
                        error={errors.discount?.message}
                        {...register('discount', {
                            min: { value: 0, message: 'Diskon tidak boleh negatif' },
                            validate: (value) => {
                                const discountVal = parseFloat(value) || 0;
                                const amountVal = parseFloat(watchedAmount) || 0;
                                if (discountVal > amountVal) {
                                    return 'Diskon tidak boleh lebih besar dari jumlah';
                                }
                                return true;
                            }
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

                    {/* Payment Method Selection */}
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

                    {/* Reference Number - Only for Transfer */}
                    {watchedPaymentMethod === 'transfer' && (
                        <div className="md:col-span-2">
                            <Input
                                label="Nomor Referensi Transfer"
                                placeholder="Nomor bukti transfer / rekening pengirim"
                                icon={<CreditCard className="w-4 h-4" />}
                                helper="Opsional - nomor bukti transfer atau rekening pengirim"
                                {...register('referenceNumber')}
                            />
                        </div>
                    )}

                    {/* Payment Proof Upload */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Bukti Pembayaran
                        </label>

                        {!paymentProof ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-surface-border rounded-xl p-6 text-center cursor-pointer hover:border-primary-500/50 hover:bg-surface-glass transition-all duration-200"
                            >
                                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">
                                    Klik untuk upload bukti pembayaran
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Format: JPG, PNG (Maks. 5MB)
                                </p>
                            </div>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden border border-surface-border">
                                <img
                                    src={paymentProof.preview}
                                    alt="Payment proof preview"
                                    className="w-full h-40 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white">
                                        <Image className="w-4 h-4" />
                                        <span className="text-sm truncate max-w-[200px]">
                                            {paymentProof.file.name}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="p-1.5 bg-rose-500/80 hover:bg-rose-500 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Opsional - upload foto bukti pembayaran (transfer/kwitansi)
                        </p>
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
                                rows={2}
                                placeholder="Keterangan tambahan..."
                                {...register('description')}
                            />
                        </div>
                    </div>

                    {/* Payment Summary - Show when amount is entered */}
                    {grossAmount > 0 && (
                        <div className="md:col-span-2 bg-dark-tertiary/50 rounded-xl p-4 border border-surface-border">
                            <h4 className="text-sm font-medium text-gray-400 mb-3">Ringkasan Pembayaran</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Jumlah Pembayaran</span>
                                    <span className="text-white">{formatCurrency(grossAmount)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Diskon</span>
                                        <span className="text-rose-400">-{formatCurrency(discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-surface-border">
                                    <span className="font-medium text-white">Total Diterima</span>
                                    <span className="font-bold text-lg text-emerald-400">{formatCurrency(netAmount)}</span>
                                </div>

                                {/* Show remaining balance after payment for cicilan/pelunasan */}
                                {jamaahPaymentInfo && (watchedCategory === 'cicilan' || watchedCategory === 'pelunasan') && (
                                    <div className="mt-3 pt-3 border-t border-surface-border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info className="w-4 h-4 text-blue-400" />
                                            <span className="text-xs text-blue-400">Estimasi setelah pembayaran ini</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Sisa yang harus dibayar</span>
                                            <span className={`font-semibold ${remainingAfterPayment <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {remainingAfterPayment <= 0 ? 'LUNAS' : formatCurrency(remainingAfterPayment)}
                                            </span>
                                        </div>
                                        {remainingAfterPayment <= 0 && netAmount >= jamaahPaymentInfo.remainingAmount && (
                                            <p className="text-xs text-emerald-400 mt-1">
                                                🎉 Pembayaran ini akan melunasi seluruh tagihan jamaah
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-surface-border">
                    <Button variant="secondary" onClick={onClose} type="button" className="w-full sm:w-auto">
                        Batal
                    </Button>
                    <Button type="submit" loading={createMutation.isPending} className="w-full sm:w-auto">
                        Simpan Pemasukan
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddIncomeModal;
