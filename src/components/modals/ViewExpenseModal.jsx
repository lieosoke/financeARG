import React from 'react';
import { Calendar, Building2, Package, FileText, Tag, CreditCard, Image as ImageIcon, Download } from 'lucide-react';
import Modal from '../molecules/Modal';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import { formatCurrency } from '../../utils/formatters';
import { formatDateToID } from '../../utils/dateUtils';

const ViewExpenseModal = ({ isOpen, onClose, data }) => {
    if (!data) return null;

    const getCategoryBadge = (kategori) => {
        const config = {
            tiket_pesawat: { variant: 'info', label: 'Tiket Pesawat' },
            hotel: { variant: 'primary', label: 'Hotel' },
            hotel_transit: { variant: 'primary', label: 'Hotel Transit' },
            transport: { variant: 'warning', label: 'Transport' },
            visa: { variant: 'neutral', label: 'Visa' },
            handling: { variant: 'success', label: 'Handling' },
            muthawif: { variant: 'success', label: 'Muthawif' },
            konsumsi: { variant: 'success', label: 'Konsumsi' },
            manasik: { variant: 'info', label: 'Manasik' },
            tour_leader: { variant: 'warning', label: 'Tour Leader' },
            operasional_kantor: { variant: 'neutral', label: 'Operasional Kantor' },
            atk_kantor: { variant: 'neutral', label: 'ATK Kantor' },
            keperluan_kantor_lainnya: { variant: 'neutral', label: 'Keperluan Kantor Lainnya' },
            ujroh: { variant: 'success', label: 'Ujroh' },
            lainnya: { variant: 'neutral', label: 'Lainnya' },
        };
        const cat = config[kategori] || { variant: 'neutral', label: kategori || 'Lainnya' };
        return <Badge variant={cat.variant}>{cat.label}</Badge>;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detail Pengeluaran"
            subtitle={`Transaksi #${data.id?.substring(0, 8) || '-'}`}
            size="lg"
        >
            <div className="space-y-6">
                {/* Header Summary */}
                <div className="bg-gradient-to-r from-rose-500/10 to-rose-600/5 border border-rose-500/20 rounded-2xl p-6 text-center">
                    <p className="text-gray-400 text-sm mb-1">Total Pengeluaran</p>
                    <h3 className="text-3xl font-bold text-rose-400 mb-2">
                        -{formatCurrency(parseFloat(data.amount) || 0)}
                    </h3>
                    <div className="flex justify-center gap-2">
                        {getCategoryBadge(data.expenseCategory)}
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
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Vendor</p>
                                <p className="text-white font-medium">{data.vendor?.name || data.vendorName || '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-dark-tertiary rounded-lg text-purple-400">
                                <Package className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Paket</p>
                                <p className="text-white font-medium">{data.package?.name || data.packageName || data.packageCode || '-'}</p>
                                {data.package?.departureDate && (
                                    <p className="text-xs text-gray-400">
                                        Berangkat: {formatDateToID(data.package.departureDate)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Category Info */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Kategori & Tanggal</h4>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-dark-tertiary rounded-lg text-blue-400">
                                <Tag className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Kategori</p>
                                <div className="mt-1">{getCategoryBadge(data.expenseCategory)}</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-dark-tertiary rounded-lg text-amber-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Tanggal Transaksi</p>
                                <p className="text-white font-medium">{formatDateToID(data.transactionDate)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-dark-tertiary rounded-lg text-emerald-400">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Metode Pembayaran</p>
                                <p className="text-white font-medium capitalize">{data.paymentMethod === 'cash' ? 'Cash' : 'Transfer' || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                {(data.description || data.notes) && (
                    <div className="pt-4 border-t border-surface-border">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Keterangan</h4>
                        <div className="bg-dark-tertiary/50 p-4 rounded-xl text-gray-300 text-sm">
                            {data.description || data.notes}
                        </div>
                    </div>
                )}

                {/* Payment Proof Photo */}
                {data.receiptUrl && (
                    <div className="pt-4 border-t border-surface-border">
                        <h4 className="text-sm font-medium text-gray-500 mb-3">Bukti Pembayaran</h4>
                        <div className="relative rounded-xl overflow-hidden border border-surface-border bg-dark-tertiary/30">
                            <img
                                src={data.receiptUrl}
                                alt="Bukti Pembayaran"
                                className="w-full h-auto max-h-96 object-contain"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                <div className="flex items-center justify-between text-white text-sm">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        <span>Bukti Pembayaran</span>
                                    </div>
                                    <a
                                        href={data.receiptUrl}
                                        download="bukti-pembayaran.jpg"
                                        className="flex items-center gap-1 px-2 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors"
                                    >
                                        <Download className="w-3 h-3" />
                                        <span className="text-xs">Download</span>
                                    </a>
                                </div>
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
    );
};

export default ViewExpenseModal;
