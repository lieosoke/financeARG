import React, { useState, useMemo, useRef } from 'react';
import { FileText, Download, Printer, Search, User, Loader2, Building2, CreditCard, Wallet } from 'lucide-react';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Badge from '../../components/atoms/Badge';
import { formatCurrency } from '../../utils/formatters';
import { useJamaahList } from '../../hooks/useJamaah';
import { useIncomeTransactions } from '../../hooks/useTransactions';
import { useCompanySettings } from '../../hooks/useCompanySettings';
import { useAuth } from '../../contexts/AuthContext';

// Default company info (fallback when settings not configured)
const DEFAULT_COMPANY_INFO = {
    name: 'Perusahaan Anda',
    address: 'Alamat belum diatur',
    city: 'Kota belum diatur',
    phone: '-',
    email: '-',
};

// Map income category to display label
const categoryLabels = {
    dp: 'DP',
    cicilan: 'Cicilan',
    pelunasan: 'Pelunasan',
    lainnya: 'Lainnya',
};

// Payment method labels
const paymentMethodLabels = {
    cash: 'Tunai (Cash)',
    transfer: 'Transfer Bank',
};

const InvoiceGenerator = () => {
    const { user } = useAuth();
    const invoiceRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJamaahId, setSelectedJamaahId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [receiverName, setReceiverName] = useState('');
    const [senderName, setSenderName] = useState(user?.name || '');
    const [showPrintView, setShowPrintView] = useState(false);

    // Fetch jamaah list from API
    const { data: jamaahData, isLoading: jamaahLoading, error: jamaahError } = useJamaahList({ limit: 100 });

    // Fetch company settings
    const { data: companySettingsData } = useCompanySettings();

    // Build company info from settings or use defaults
    const COMPANY_INFO = useMemo(() => {
        if (companySettingsData?.data) {
            return {
                name: companySettingsData.data.name || DEFAULT_COMPANY_INFO.name,
                address: companySettingsData.data.address || DEFAULT_COMPANY_INFO.address,
                city: companySettingsData.data.city || DEFAULT_COMPANY_INFO.city,
                phone: companySettingsData.data.phone || DEFAULT_COMPANY_INFO.phone,
                email: companySettingsData.data.email || DEFAULT_COMPANY_INFO.email,
            };
        }
        return DEFAULT_COMPANY_INFO;
    }, [companySettingsData]);

    // Fetch payment history for selected jamaah
    const { data: paymentsData, isLoading: paymentsLoading } = useIncomeTransactions(
        { jamaahId: selectedJamaahId, limit: 50 },
        { enabled: !!selectedJamaahId }
    );

    // Get selected jamaah with full data from API response
    const selectedJamaahFull = useMemo(() => {
        if (!selectedJamaahId || !jamaahData?.data) return null;
        return jamaahData.data.find(j => j.id === selectedJamaahId) || null;
    }, [jamaahData, selectedJamaahId]);

    // Transform jamaah data from API for list display
    const jamaahList = useMemo(() => {
        if (!jamaahData?.data) return [];
        return jamaahData.data.map(j => ({
            id: j.id,
            nama: j.name,
            paket: j.package?.packageName || j.package?.packageCode || 'Belum ada paket',
            harga: parseFloat(j.totalAmount) || 0,
            dibayar: parseFloat(j.paidAmount) || 0,
            sisa: parseFloat(j.remainingAmount) || 0,
            status: j.paymentStatus,
        }));
    }, [jamaahData]);

    // Get selected jamaah object for display
    const selectedJamaah = useMemo(() => {
        if (!selectedJamaahId) return null;
        const found = jamaahList.find(j => j.id === selectedJamaahId);
        if (found && selectedJamaahFull) {
            // Ensure we have the correct package name
            return {
                ...found,
                paket: selectedJamaahFull.package?.packageName || selectedJamaahFull.package?.packageCode || found.paket,
                phone: selectedJamaahFull.phone || '-',
                address: selectedJamaahFull.address || '-',
            };
        }
        return found || null;
    }, [jamaahList, selectedJamaahId, selectedJamaahFull]);

    // Transform payment history from API
    const payments = useMemo(() => {
        if (!paymentsData?.data) return [];
        return paymentsData.data.map(p => ({
            id: p.id,
            tanggal: p.transactionDate ? new Date(p.transactionDate).toLocaleDateString('id-ID') : '-',
            jenis: categoryLabels[p.incomeCategory] || p.incomeCategory || 'Pembayaran',
            amount: parseFloat(p.amount) || 0,
            paymentMethod: p.paymentMethod || 'cash',
        }));
    }, [paymentsData]);

    const getStatusBadge = (status) => {
        const config = {
            lunas: { variant: 'success', label: 'Lunas' },
            pending: { variant: 'warning', label: 'Belum Lunas' },
            dp: { variant: 'info', label: 'DP' },
            cicilan: { variant: 'secondary', label: 'Cicilan' },
            dibatalkan: { variant: 'danger', label: 'Dibatalkan' },
        };
        const s = config[status] || config.pending;
        return <Badge variant={s.variant}>{s.label}</Badge>;
    };

    const filteredData = jamaahList.filter(j =>
        j.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.paket.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectJamaah = (jamaah) => {
        setSelectedJamaahId(jamaah.id);
        setReceiverName(jamaah.nama);
    };

    const handlePrint = () => {
        setShowPrintView(true);
        setTimeout(() => {
            window.print();
            setShowPrintView(false);
        }, 100);
    };

    const handleDownloadPDF = () => {
        // Use browser's print dialog with "Save as PDF" option
        setShowPrintView(true);
        setTimeout(() => {
            window.print();
            setShowPrintView(false);
        }, 100);
    };

    const invoiceNumber = selectedJamaah?.id ? `INV-${selectedJamaah.id.substring(0, 8).toUpperCase()}` : '';
    const invoiceDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <>
            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-area, .print-area * {
                        visibility: visible;
                    }
                    .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 210mm;
                        height: 148mm;
                        padding: 8mm 10mm;
                        background: white !important;
                        color: black !important;
                    }
                    @page {
                        size: A5 landscape;
                        margin: 0;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Print View - A5 Invoice */}
            {showPrintView && selectedJamaah && (
                <div className="print-area" ref={invoiceRef}>
                    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#000' }}>
                        {/* Header */}
                        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '12px' }}>
                            <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{COMPANY_INFO.name}</h1>
                            <p style={{ margin: '2px 0', fontSize: '9px' }}>{COMPANY_INFO.address}</p>
                            <p style={{ margin: '2px 0', fontSize: '9px' }}>{COMPANY_INFO.city}</p>
                            <p style={{ margin: '2px 0', fontSize: '9px' }}>Telp: {COMPANY_INFO.phone} | Email: {COMPANY_INFO.email}</p>
                        </div>

                        {/* Invoice Title */}
                        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                            <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>KWITANSI PEMBAYARAN</h2>
                            <p style={{ margin: '4px 0', fontSize: '9px' }}>No: {invoiceNumber}</p>
                            <p style={{ margin: '2px 0', fontSize: '9px' }}>Tanggal: {invoiceDate}</p>
                        </div>

                        {/* Customer Info */}
                        <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid #ccc' }}>
                            <table style={{ width: '100%', fontSize: '9px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '80px', padding: '2px 0' }}>Nama</td>
                                        <td style={{ padding: '2px 0' }}>: <strong>{selectedJamaah.nama}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '2px 0' }}>Paket</td>
                                        <td style={{ padding: '2px 0' }}>: {selectedJamaah.paket}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '2px 0' }}>Metode Bayar</td>
                                        <td style={{ padding: '2px 0' }}>: {paymentMethodLabels[paymentMethod]}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Payment Details */}
                        <div style={{ marginBottom: '12px' }}>
                            <table style={{ width: '100%', fontSize: '9px', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                                        <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'left' }}>Keterangan</th>
                                        <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', width: '80px' }}>Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>Harga Paket</td>
                                        <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>{formatCurrency(selectedJamaah.harga)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>Total Dibayar</td>
                                        <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>{formatCurrency(selectedJamaah.dibayar)}</td>
                                    </tr>
                                    <tr style={{ fontWeight: 'bold' }}>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>Sisa Pembayaran</td>
                                        <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>{formatCurrency(selectedJamaah.sisa)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Payment Method Note */}
                        <div style={{ marginBottom: '16px', fontSize: '9px', padding: '6px', backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
                            <strong>Metode Pembayaran:</strong> {paymentMethodLabels[paymentMethod]}
                            {paymentMethod === 'transfer' && (
                                <span> (BCA: 1234567890 a.n. ARG Tour)</span>
                            )}
                        </div>

                        {/* Signature Section */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                            <div style={{ textAlign: 'center', width: '45%' }}>
                                <p style={{ fontSize: '9px', margin: '0 0 40px 0' }}>Yang Menyerahkan,</p>
                                <p style={{ fontSize: '9px', margin: 0, borderTop: '1px solid #000', paddingTop: '4px' }}>
                                    <strong>{senderName || '.....................'}</strong>
                                </p>
                            </div>
                            <div style={{ textAlign: 'center', width: '45%' }}>
                                <p style={{ fontSize: '9px', margin: '0 0 40px 0' }}>Yang Menerima,</p>
                                <p style={{ fontSize: '9px', margin: 0, borderTop: '1px solid #000', paddingTop: '4px' }}>
                                    <strong>{receiverName || '.....................'}</strong>
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '8px', color: '#666' }}>
                            <p style={{ margin: 0 }}>Terima kasih atas kepercayaan Anda</p>
                            <p style={{ margin: '2px 0' }}>{COMPANY_INFO.name}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main UI - hide when printing */}
            <div className={`space-y-6 animate-fade-in ${showPrintView ? 'no-print' : ''}`}>
                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">Invoice Generator</h1>
                    <p className="text-sm text-gray-500 mt-1">Generate invoice pembayaran jamaah</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Jamaah List */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card>
                            <Input
                                placeholder="Cari jamaah..."
                                icon={<Search className="w-4 h-4" />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Card>

                        <Card title="Pilih Jamaah" className="!p-0">
                            <div className="divide-y divide-surface-border max-h-[400px] overflow-y-auto">
                                {jamaahLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
                                    </div>
                                ) : jamaahError ? (
                                    <div className="text-center py-8">
                                        <p className="text-rose-400">Gagal memuat data jamaah</p>
                                    </div>
                                ) : filteredData.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Tidak ada jamaah ditemukan</p>
                                    </div>
                                ) : (
                                    filteredData.map((jamaah) => (
                                        <button
                                            key={jamaah.id}
                                            className={`w-full p-4 text-left hover:bg-surface-glass transition-colors ${selectedJamaah?.id === jamaah.id ? 'bg-primary-500/10 border-l-2 border-primary-500' : ''
                                                }`}
                                            onClick={() => handleSelectJamaah(jamaah)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-white">{jamaah.nama}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{jamaah.paket}</p>
                                                </div>
                                                {getStatusBadge(jamaah.status)}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Invoice Preview */}
                    <div className="lg:col-span-2">
                        {selectedJamaah ? (
                            <div className="space-y-4">
                                {/* Invoice Options */}
                                <Card title="Pengaturan Invoice">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Metode Pembayaran
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setPaymentMethod('cash')}
                                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${paymentMethod === 'cash'
                                                        ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                                        : 'border-surface-border text-gray-400 hover:bg-surface-glass'
                                                        }`}
                                                >
                                                    <Wallet className="w-4 h-4" />
                                                    Cash
                                                </button>
                                                <button
                                                    onClick={() => setPaymentMethod('transfer')}
                                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${paymentMethod === 'transfer'
                                                        ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                                        : 'border-surface-border text-gray-400 hover:bg-surface-glass'
                                                        }`}
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                    Transfer
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Yang Menyerahkan
                                            </label>
                                            <Input
                                                placeholder="Nama pengirim"
                                                value={senderName}
                                                onChange={(e) => setSenderName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Yang Menerima
                                            </label>
                                            <Input
                                                placeholder="Nama penerima"
                                                value={receiverName}
                                                onChange={(e) => setReceiverName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </Card>

                                {/* Invoice Card */}
                                <Card className="!p-0">
                                    {/* Invoice Header */}
                                    <div className="p-6 border-b border-surface-border">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-white">KWITANSI</h2>
                                                <p className="text-sm text-gray-500">{invoiceNumber}</p>
                                                <p className="text-xs text-gray-600">{invoiceDate}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    icon={<Printer className="w-4 h-4" />}
                                                    onClick={handlePrint}
                                                >
                                                    Print
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    icon={<Download className="w-4 h-4" />}
                                                    onClick={handleDownloadPDF}
                                                >
                                                    Download PDF
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Invoice Content */}
                                    <div className="p-6 space-y-6">
                                        {/* Company & Customer Info */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Dari</p>
                                                <div className="flex items-start gap-2">
                                                    <Building2 className="w-4 h-4 text-primary-400 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-white">{COMPANY_INFO.name}</p>
                                                        <p className="text-sm text-gray-400">{COMPANY_INFO.address}</p>
                                                        <p className="text-sm text-gray-400">{COMPANY_INFO.city}</p>
                                                        <p className="text-sm text-gray-400">Telp: {COMPANY_INFO.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Kepada</p>
                                                <div className="flex items-start gap-2">
                                                    <User className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-white">{selectedJamaah.nama}</p>
                                                        <p className="text-sm text-gray-400">{selectedJamaah.paket}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div className="bg-dark-tertiary/50 rounded-xl p-4">
                                            <div className="flex items-center gap-3">
                                                {paymentMethod === 'cash' ? (
                                                    <Wallet className="w-5 h-5 text-emerald-400" />
                                                ) : (
                                                    <CreditCard className="w-5 h-5 text-blue-400" />
                                                )}
                                                <div>
                                                    <p className="text-sm text-gray-500">Metode Pembayaran</p>
                                                    <p className="font-medium text-white">{paymentMethodLabels[paymentMethod]}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Package Info */}
                                        <div className="bg-dark-tertiary/50 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-500">Paket</p>
                                                    <p className="font-medium text-white">{selectedJamaah.paket}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">Harga</p>
                                                    <p className="font-semibold text-primary-400">{formatCurrency(selectedJamaah.harga)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment History */}
                                        <div>
                                            <p className="text-sm font-medium text-gray-400 mb-3">Riwayat Pembayaran</p>
                                            <div className="space-y-2">
                                                {paymentsLoading ? (
                                                    <div className="flex items-center justify-center py-4">
                                                        <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
                                                    </div>
                                                ) : payments.length === 0 ? (
                                                    <p className="text-gray-500 text-sm py-2">Belum ada riwayat pembayaran</p>
                                                ) : (
                                                    payments.map((payment) => (
                                                        <div key={payment.id} className="flex items-center justify-between py-2 border-b border-surface-border">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                                                    <FileText className="w-4 h-4 text-emerald-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-white">{payment.jenis}</p>
                                                                    <p className="text-xs text-gray-500">{payment.tanggal}</p>
                                                                </div>
                                                            </div>
                                                            <span className="font-tabular text-emerald-400">{formatCurrency(payment.amount)}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Summary */}
                                        <div className="bg-dark-tertiary/50 rounded-xl p-4 space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400">Total Harga</span>
                                                <span className="text-white">{formatCurrency(selectedJamaah.harga)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400">Total Dibayar</span>
                                                <span className="text-emerald-400">{formatCurrency(selectedJamaah.dibayar)}</span>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-surface-border">
                                                <span className="font-medium text-white">Sisa Pembayaran</span>
                                                <span className={`font-bold text-lg ${selectedJamaah.sisa > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                    {formatCurrency(selectedJamaah.sisa)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Sender/Receiver Info */}
                                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-surface-border">
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Yang Menyerahkan</p>
                                                <div className="h-16 border-b border-dashed border-surface-border mb-2"></div>
                                                <p className="text-sm font-medium text-white">{senderName || '...'}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Yang Menerima</p>
                                                <div className="h-16 border-b border-dashed border-surface-border mb-2"></div>
                                                <p className="text-sm font-medium text-white">{receiverName || '...'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ) : (
                            <Card>
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-surface-glass rounded-2xl flex items-center justify-center">
                                        <User className="w-8 h-8 text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-2">Pilih Jamaah</h3>
                                    <p className="text-gray-500">Pilih jamaah dari daftar untuk melihat dan generate invoice</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default InvoiceGenerator;
