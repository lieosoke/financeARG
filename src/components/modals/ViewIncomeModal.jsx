import React, { useState } from 'react';
import { X, Calendar, User, Package, FileText, CreditCard, Wallet, Download, Eye } from 'lucide-react';
import Modal from '../molecules/Modal';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import ImageModal from './ImageModal';
import { formatCurrency } from '../../utils/formatters';
import { formatDateToID } from '../../utils/dateUtils';

const ViewIncomeModal = ({ isOpen, onClose, data }) => {
    const [showImageModal, setShowImageModal] = useState(false);

    if (!data) return null;

    const getCategoryBadge = (kategori) => {
        const config = {
            dp: { variant: 'info', label: 'DP' },
            cicilan: { variant: 'warning', label: 'Cicilan' },
            pelunasan: { variant: 'success', label: 'Pelunasan' },
            lainnya: { variant: 'neutral', label: 'Lainnya' },
        };
        const cat = config[kategori] || config.lainnya;
        return <Badge variant={cat.variant}>{cat.label}</Badge>;
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Detail Pemasukan"
                subtitle={`Transaksi #${data.id.substring(0, 8)}`}
                size="lg"
            >
                <div className="space-y-6">
                    {/* Header Summary */}
                    <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-6 text-center">
                        <p className="text-gray-400 text-sm mb-1">Total Pemasukan</p>
                        <h3 className="text-3xl font-bold text-emerald-400 mb-2">
                            {formatCurrency(parseFloat(data.amount) || 0)}
                        </h3>
                        <div className="flex justify-center gap-2">
                            {getCategoryBadge(data.incomeCategory)}
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-surface-glass text-gray-400 border border-surface-border">
                                {formatDateToID(data.transactionDate)}
                            </span>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Main Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Informasi Utama</h4>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-dark-tertiary rounded-lg text-primary-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Jamaah</p>
                                    <p className="text-white font-medium">{data.jamaah?.name || '-'}</p>
                                    {data.jamaah?.phone && <p className="text-xs text-gray-400">{data.jamaah.phone}</p>}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-dark-tertiary rounded-lg text-purple-400">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Paket</p>
                                    <p className="text-white font-medium">{data.package?.packageName || data.package?.name || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Metode Pembayaran</h4>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-dark-tertiary rounded-lg text-blue-400">
                                    {data.paymentMethod === 'cash' ? <Wallet className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Metode</p>
                                    <p className="text-white font-medium capitalize">{data.paymentMethod}</p>
                                    {data.referenceNumber && (
                                        <p className="text-xs text-gray-400">Ref: {data.referenceNumber}</p>
                                    )}
                                </div>
                            </div>

                            {data.discount > 0 && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-dark-tertiary rounded-lg text-amber-400">
                                        <span className="text-lg font-bold">%</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Diskon</p>
                                        <p className="text-amber-400 font-medium">-{formatCurrency(parseFloat(data.discount))}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Info */}
                    {data.description && (
                        <div className="pt-4 border-t border-surface-border">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Keterangan</h4>
                            <div className="bg-dark-tertiary/50 p-4 rounded-xl text-gray-300 text-sm">
                                {data.description}
                            </div>
                        </div>
                    )}

                    {/* Receipt Image */}
                    {data.receiptUrl && (
                        <div className="pt-4 border-t border-surface-border">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Bukti Pembayaran</h4>
                            <div className="rounded-xl overflow-hidden border border-surface-border relative group">
                                <img
                                    src={data.receiptUrl}
                                    alt="Bukti Pembayaran"
                                    className="w-full max-h-60 object-contain bg-black/50"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        size="sm"
                                        onClick={() => setShowImageModal(true)}
                                        icon={<Eye className="w-4 h-4" />}
                                    >
                                        Lihat Full
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-surface-border flex justify-end">
                        <Button variant="secondary" onClick={onClose}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Image Modal */}
            <ImageModal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                imageUrl={data.receiptUrl}
            />
        </>
    );
};

export default ViewIncomeModal;
