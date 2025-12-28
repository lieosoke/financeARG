import React from 'react';
import { X, Calendar, FileText, DollarSign, Building2 } from 'lucide-react';
import Modal from '../molecules/Modal';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import { formatCurrency } from '../../utils/formatters';

const VendorDebtDetailModal = ({ isOpen, onClose, debt }) => {
    if (!debt) return null;

    const totalAmount = parseFloat(debt.totalAmount) || 0;
    const paidAmount = parseFloat(debt.paidAmount) || 0;
    const remaining = totalAmount - paidAmount;

    // Status Logic (reused for consistency)
    const getStatusBadge = (status) => {
        const config = {
            paid: { variant: 'success', label: 'Lunas' },
            partial: { variant: 'warning', label: 'Outstanding' },
            unpaid: { variant: 'neutral', label: 'Belum Bayar' },
            overdue: { variant: 'danger', label: 'Overdue' },
        };
        const stat = config[status] || { variant: 'neutral', label: status };
        return <Badge variant={stat.variant}>{stat.label}</Badge>;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detail Hutang Vendor"
            subtitle={`Informasi detail hutang ID #${debt.id?.substring(0, 8)}`}
            size="md"
        >
            <div className="space-y-6">
                {/* Header Status */}
                <div className="flex items-center justify-between p-4 bg-dark-tertiary/30 rounded-xl border border-surface-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-glass rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Vendor</p>
                            <p className="font-semibold text-white">{debt.vendor?.name || '-'}</p>
                        </div>
                    </div>
                    {getStatusBadge(debt.status)}
                </div>

                {/* Amount Details */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-dark-tertiary/30 rounded-xl border border-surface-border text-center">
                        <p className="text-xs text-gray-500 mb-1">Total Hutang</p>
                        <p className="font-semibold text-white text-sm lg:text-base">
                            {formatCurrency(totalAmount)}
                        </p>
                    </div>
                    <div className="p-4 bg-dark-tertiary/30 rounded-xl border border-surface-border text-center">
                        <p className="text-xs text-gray-500 mb-1">Sudah Dibayar</p>
                        <p className="font-semibold text-emerald-400 text-sm lg:text-base">
                            {formatCurrency(paidAmount)}
                        </p>
                    </div>
                    <div className="p-4 bg-dark-tertiary/30 rounded-xl border border-surface-border text-center">
                        <p className="text-xs text-gray-500 mb-1">Sisa</p>
                        <p className={`font-semibold text-sm lg:text-base ${remaining > 0 ? 'text-amber-400' : 'text-gray-400'}`}>
                            {formatCurrency(remaining)}
                        </p>
                    </div>
                </div>

                {/* Info List */}
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-300">Deskripsi</p>
                            <p className="text-sm text-gray-400 mt-1">{debt.description || '-'}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-300">Jatuh Tempo</p>
                            <p className="text-sm text-gray-400 mt-1">
                                {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : '-'}
                            </p>
                        </div>
                    </div>

                    {debt.notes && (
                        <div className="flex gap-4">
                            <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-300">Catatan</p>
                                <p className="text-sm text-gray-400 mt-1">{debt.notes}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action */}
                <div className="flex justify-end pt-4 border-t border-surface-border">
                    <Button variant="secondary" onClick={onClose}>
                        Tutup
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default VendorDebtDetailModal;
