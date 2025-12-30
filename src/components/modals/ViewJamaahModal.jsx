import React from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, CreditCard, Package, Wallet, Users, Home } from 'lucide-react';
import Modal from '../molecules/Modal';
import Badge from '../atoms/Badge';
import { formatCurrency } from '../../utils/formatters';
import { formatDateToID } from '../../utils/dateUtils';

const ViewJamaahModal = ({ isOpen, onClose, data }) => {
    if (!data) return null;

    const totalAmount = parseFloat(data.totalAmount) || 0;
    const paidAmount = parseFloat(data.paidAmount) || 0;
    const sisaBayar = totalAmount - paidAmount;

    const getStatusBadge = (status) => {
        const statusConfig = {
            lunas: { variant: 'success', label: 'Lunas' },
            pending: { variant: 'warning', label: 'Belum Lunas' },
            dp: { variant: 'info', label: 'DP' },
            cicilan: { variant: 'secondary', label: 'Cicilan' },
            dibatalkan: { variant: 'danger', label: 'Dibatalkan' },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Badge variant={config.variant} dot>{config.label}</Badge>;
    };

    const getGenderLabel = (gender) => {
        return gender === 'male' ? 'Laki-laki' : 'Perempuan';
    };

    const getMaritalStatusLabel = (status) => {
        const labels = {
            single: 'Belum Menikah',
            married: 'Menikah',
            divorced: 'Cerai Hidup',
            widowed: 'Cerai Mati'
        };
        return labels[status] || status;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detail Jamaah"
            subtitle="Informasi lengkap data jamaah"
            size="2xl"
        >
            <div className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Informasi Pribadi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-dark-tertiary/30 p-4 rounded-xl border border-surface-border">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Nama Lengkap</label>
                            <p className="text-white font-medium">{data.title ? `${data.title}. ` : ''}{data.name || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">NIK</label>
                            <p className="text-white font-medium">{data.nik || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Jenis Kelamin</label>
                            <p className="text-white">{data.gender ? getGenderLabel(data.gender) : '-'}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Lahir</label>
                            <p className="text-white">{data.dateOfBirth ? formatDateToID(data.dateOfBirth) : '-'}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Tempat Lahir</label>
                            <p className="text-white">{data.placeOfBirth || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status Pernikahan</label>
                            <p className="text-white">{data.maritalStatus ? getMaritalStatusLabel(data.maritalStatus) : '-'}</p>
                        </div>
                        {data.passportNumber && (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Nomor Paspor</label>
                                    <p className="text-white font-medium">{data.passportNumber}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Berlaku Hingga</label>
                                    <p className="text-white">{data.passportExpiry ? formatDateToID(data.passportExpiry) : '-'}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Informasi Kontak
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-dark-tertiary/30 p-4 rounded-xl border border-surface-border">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Nomor Telepon</label>
                            <p className="text-white font-medium">{data.phone || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                            <p className="text-white">{data.email || '-'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Alamat</label>
                            <p className="text-white">{data.address || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                {(data.emergencyContactName || data.emergencyContactPhone) && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Kontak Darurat
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-dark-tertiary/30 p-4 rounded-xl border border-surface-border">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Nama</label>
                                <p className="text-white font-medium">{data.emergencyContactName || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Nomor Telepon</label>
                                <p className="text-white">{data.emergencyContactPhone || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Hubungan</label>
                                <p className="text-white">{data.emergencyContactRelation || '-'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Package & Payment Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Paket & Pembayaran
                    </h3>
                    <div className="bg-dark-tertiary/30 p-4 rounded-xl border border-surface-border space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Paket</label>
                                <p className="text-white font-medium">{data.package?.name || data.packageName || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Status Pembayaran</label>
                                <div>{getStatusBadge(data.paymentStatus || 'pending')}</div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-surface-border">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Total Biaya</label>
                                    <p className="text-lg font-bold text-white">{formatCurrency(totalAmount)}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Sudah Dibayar</label>
                                    <p className="text-lg font-bold text-emerald-400">{formatCurrency(paidAmount)}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Sisa Pembayaran</label>
                                    <p className={`text-lg font-bold ${sisaBayar > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {formatCurrency(sisaBayar)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Room Information */}
                {(data.roomType || data.roomNumber) && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            Informasi Kamar
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-dark-tertiary/30 p-4 rounded-xl border border-surface-border">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Tipe Kamar</label>
                                <p className="text-white capitalize">{data.roomType || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Nomor Kamar</label>
                                <p className="text-white">{data.roomNumber || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Teman Sekamar</label>
                                <p className="text-white">{data.roomMate || '-'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notes */}
                {data.notes && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Catatan</h3>
                        <div className="bg-dark-tertiary/30 p-4 rounded-xl border border-surface-border">
                            <p className="text-white text-sm">{data.notes}</p>
                        </div>
                    </div>
                )}

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t border-surface-border">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-surface-glass hover:bg-surface-glass/80 text-white rounded-xl transition-colors duration-200"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ViewJamaahModal;
