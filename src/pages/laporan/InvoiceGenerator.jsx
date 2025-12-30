import React, { useState, useMemo, useRef } from 'react';
import { FileText, Download, Printer, Search, User, Loader2, Building2, CreditCard, Wallet, FileSpreadsheet, Eye, CheckSquare, Square, X, Calendar, Package, ChevronDown } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Badge from '../../components/atoms/Badge';
import { formatCurrency } from '../../utils/formatters';
import { useJamaahList } from '../../hooks/useJamaah';
import { usePackages } from '../../hooks/usePackages';
import { useIncomeTransactions } from '../../hooks/useTransactions';
import { useCompanySettings } from '../../hooks/useCompanySettings';
import { useAuth } from '../../contexts/AuthContext';
import { transactionService } from '../../services/api/index';
import logo from '../../assets/images/logo.png';

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
    const queryClient = useQueryClient();
    const invoiceRef = useRef(null);
    const [searchQuery, setSearchJamaahQuery] = useState('');
    const [selectedJamaahId, setSelectedJamaahId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash'); // Default payment method for Quick Invoice
    // SWAPPED DEFAULTS: Receiver = User, Sender = Jamaah (set later or empty)
    const [receiverName, setReceiverName] = useState(user?.name || '');
    const [senderName, setSenderName] = useState('');
    const [showPrintView, setShowPrintView] = useState(false);

    // Batch Print State
    const [selectedBatchIds, setSelectedBatchIds] = useState(new Set());
    const [isPreparingBatch, setIsPreparingBatch] = useState(false);
    const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
    const [batchInvoices, setBatchInvoices] = useState([]);

    // Filter State
    const [filterPackageId, setFilterPackageId] = useState('');
    const [filterDepartureDate, setFilterDepartureDate] = useState('');

    // Fetch jamaah list
    const { data: jamaahData, isLoading: jamaahLoading, error: jamaahError } = useJamaahList({ limit: 1000 });

    // Fetch packages for dropdown
    const { data: packagesData } = usePackages({ limit: 100 });

    // Fetch company settings
    const { data: companySettingsData } = useCompanySettings();

    // Build company info
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

    // Fetch payment history for SINGLE selected jamaah (preview mode)
    const { data: paymentsData, isLoading: paymentsLoading } = useIncomeTransactions(
        { jamaahId: selectedJamaahId, limit: 50 },
        { enabled: !!selectedJamaahId && !isPreparingBatch }
    );

    // Transform jamaah data
    const jamaahList = useMemo(() => {
        if (!jamaahData?.data) return [];
        return jamaahData.data.map(j => ({
            id: j.id,
            nama: j.name,
            paket: j.package?.name || j.package?.code || 'Belum ada paket',
            harga: parseFloat(j.totalAmount) || 0,
            dibayar: parseFloat(j.paidAmount) || 0,
            sisa: parseFloat(j.remainingAmount) || 0,
            status: j.paymentStatus,
            // Keep full object for batch processing needs
            raw: j,
        }));
    }, [jamaahData]);

    // Single Selected Jamaah Object
    const selectedJamaah = useMemo(() => {
        if (!selectedJamaahId) return null;
        const found = jamaahList.find(j => j.id === selectedJamaahId);
        if (found && found.raw) {
            return prepareJamaahForPrint(found.raw);
        }
        return found || null;
    }, [jamaahList, selectedJamaahId]);

    // Helper to format jamaah data for print
    function prepareJamaahForPrint(rawJamaah) {
        const departureDate = rawJamaah.package?.departureDate
            ? new Date(rawJamaah.package.departureDate).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
            })
            : '-';
        return {
            id: rawJamaah.raw?.id || rawJamaah.id,
            nama: rawJamaah.name,
            paket: rawJamaah.package?.name || rawJamaah.package?.code || 'Belum ada paket',
            tanggalKeberangkatan: departureDate,
            phone: rawJamaah.phone || '-',
            address: rawJamaah.address || '-',
            harga: parseFloat(rawJamaah.totalAmount) || 0,
            dibayar: parseFloat(rawJamaah.paidAmount) || 0,
            sisa: parseFloat(rawJamaah.remainingAmount) || 0,
        };
    }

    // Helper to transform payments
    function transformPayments(paymentsRaw) {
        if (!paymentsRaw) return [];
        return paymentsRaw.map((p, index) => ({
            no: index + 1,
            id: p.id,
            tanggal: p.transactionDate ? new Date(p.transactionDate).toLocaleDateString('id-ID') : '-',
            jenis: categoryLabels[p.incomeCategory] || p.incomeCategory || 'Pembayaran',
            amount: parseFloat(p.amount) || 0,
            discount: parseFloat(p.discount) || 0,
            paymentMethod: p.paymentMethod || 'cash',
            receiptUrl: p.receiptUrl || null,
            notes: p.notes,
        }));
    }

    // Single Jamaah Payments (Preview)
    const singleJamaahPayments = useMemo(() => {
        return transformPayments(paymentsData?.data);
    }, [paymentsData]);

    const singleJamaahTotalDiscount = useMemo(() => {
        return singleJamaahPayments.reduce((sum, p) => sum + p.discount, 0);
    }, [singleJamaahPayments]);


    // Filter Logic
    const filteredData = useMemo(() => {
        return jamaahList.filter(j => {
            // Text search (name or package name)
            const matchesSearch = !searchQuery ||
                j.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                j.paket.toLowerCase().includes(searchQuery.toLowerCase());

            // Package filter
            const matchesPackage = !filterPackageId || j.raw?.package?.id === filterPackageId;

            // Departure date filter
            let matchesDate = true;
            if (filterDepartureDate && j.raw?.package?.departureDate) {
                const jamaahDepDate = new Date(j.raw.package.departureDate).toISOString().slice(0, 10);
                matchesDate = jamaahDepDate === filterDepartureDate;
            } else if (filterDepartureDate && !j.raw?.package?.departureDate) {
                matchesDate = false;
            }

            return matchesSearch && matchesPackage && matchesDate;
        });
    }, [jamaahList, searchQuery, filterPackageId, filterDepartureDate]);

    // Handlers
    const handleSelectJamaah = (jamaah) => {
        // If clicking on already selected item in list (not checkbox), just view it
        if (selectedJamaahId === jamaah.id) return;
        setSelectedJamaahId(jamaah.id);

        // Auto-set sender to Jamaah's name when selected
        // Receiver remains as the logged-in user (default) or whatever was manually typed
        setSenderName(jamaah.nama);
    };

    // -- BATCH SELECTION LOGIC --

    // Calculate if all currently filtered items are selected
    const isAllSelected = filteredData.length > 0 &&
        filteredData.every(j => selectedBatchIds.has(j.id));

    const handleToggleSelectAll = () => {
        const newSelected = new Set(selectedBatchIds);

        if (isAllSelected) {
            // Deselect all visible
            filteredData.forEach(j => newSelected.delete(j.id));
        } else {
            // Select all visible
            filteredData.forEach(j => newSelected.add(j.id));
        }
        setSelectedBatchIds(newSelected);
    };

    const handleToggleSelect = (e, id) => {
        e.stopPropagation(); // Prevent row click
        const newSelected = new Set(selectedBatchIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedBatchIds(newSelected);
    };

    const handlePrepareBatchPrint = async () => {
        if (selectedBatchIds.size === 0) return;

        setIsPreparingBatch(true);
        setBatchProgress({ current: 0, total: selectedBatchIds.size });
        setBatchInvoices([]);

        const idsProcess = Array.from(selectedBatchIds);
        const preparedResults = [];
        const batchSize = 5; // Process 5 requests at a time

        try {
            for (let i = 0; i < idsProcess.length; i += batchSize) {
                const chunk = idsProcess.slice(i, i + batchSize);

                const chunkPromises = chunk.map(async (id) => {
                    // Find jamaah details
                    const jamaahRaw = jamaahList.find(j => j.id === id)?.raw;
                    if (!jamaahRaw) return null;

                    // Fetch transactions manually
                    const items = await queryClient.fetchQuery({
                        queryKey: ['transactions', 'incomeList', { jamaahId: id }],
                        queryFn: () => transactionService.getIncome({ jamaahId: id, limit: 100 }),
                        staleTime: 1000 * 60 * 5 // 5 min stale
                    });

                    const payments = transformPayments(items.data);
                    const totalDiscount = payments.reduce((sum, p) => sum + p.discount, 0);

                    return {
                        jamaah: prepareJamaahForPrint(jamaahRaw),
                        payments,
                        totalDiscount,
                        sender: jamaahRaw.name, // Default Sender = Jamaah
                        receiver: user?.name || ''  // Default Receiver = User
                    };
                });

                const chunkResults = await Promise.all(chunkPromises);
                preparedResults.push(...chunkResults.filter(Boolean));

                setBatchProgress(prev => ({ ...prev, current: Math.min(idsProcess.length, i + batchSize) }));
            }

            setBatchInvoices(preparedResults);

            // Allow state to update then print
            setTimeout(() => {
                setShowPrintView(true);
                setTimeout(() => {
                    window.print();
                    setShowPrintView(false);
                    setIsPreparingBatch(false);
                    // Optional: Clear selection after print
                    // setSelectedBatchIds(new Set());
                }, 500); // Wait for DOM to render all invoices
            }, 500);

        } catch (error) {
            console.error("Batch print error:", error);
            alert("Terjadi kesalahan saat menyiapkan data invoice.");
            setIsPreparingBatch(false);
        }
    };

    // Single Print Handler
    const handlePrintSingle = () => {
        // Reuse batch logic for single print to keep template consistent
        if (!selectedJamaah) return;

        // If we have the data already loaded from the hook
        setBatchInvoices([{
            jamaah: selectedJamaah,
            payments: singleJamaahPayments,
            totalDiscount: singleJamaahTotalDiscount,
            sender: senderName, // Use state value (editable)
            receiver: receiverName // Use state value (editable)
        }]);

        setShowPrintView(true);
        setTimeout(() => {
            window.print();
            setShowPrintView(false);
        }, 100);
    };

    const handleExportCSV = () => {
        if (!selectedJamaah || singleJamaahPayments.length === 0) return;

        const headers = ['No', 'Tanggal', 'Keterangan', 'Jumlah IDR', 'Metode Bayar', 'Catatan'];
        const rows = singleJamaahPayments.map(p => [
            p.no,
            p.tanggal,
            p.jenis,
            p.amount,
            p.paymentMethod,
            p.notes || ''
        ]);
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `invoice_${selectedJamaah.nama.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const invoiceDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

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

    return (
        <>
            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A5 landscape;
                        margin: 0;
                    }
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
                        width: 100%;
                    }
                    .invoice-page {
                        position: relative;
                        width: 100%;
                        height: 100vh; /* Fallback */
                        page-break-after: always;
                        padding: 10mm;
                        background: white !important;
                        color: black !important;
                        font-family: 'Times New Roman', serif;
                        display: flex;
                        flex-direction: column;
                    }
                    .invoice-page:last-child {
                        page-break-after: avoid;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Batch Preparation Modal */}
            {isPreparingBatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface-card p-6 rounded-xl border border-surface-border max-w-sm w-full text-center space-y-4">
                        <Loader2 className="w-10 h-10 text-primary-400 animate-spin mx-auto" />
                        <div>
                            <h3 className="text-lg font-bold text-white">Menyipapkan Invoice</h3>
                            <p className="text-gray-400">
                                Memproses {batchProgress.current} dari {batchProgress.total} jamaah...
                            </p>
                        </div>
                        <div className="w-full bg-surface-border rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-primary-500 h-full transition-all duration-300"
                                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Print View Loop */}
            {showPrintView && (
                <div className="print-area">
                    {batchInvoices.map((invoiceData, idx) => (
                        <div key={invoiceData.jamaah.id} className="invoice-page">
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '10px' }}>
                                <div style={{ width: '60px', height: '60px', marginRight: '15px' }}>
                                    <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 2px 0', textTransform: 'uppercase', lineHeight: '1.2' }}>Penyelenggara Perjalanan Haji dan Umroh</h2>
                                    <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 2px 0', lineHeight: '1.2' }}>{COMPANY_INFO.name}</h1>
                                    <p style={{ margin: '0', fontSize: '10px', lineHeight: '1.2' }}>Alamat: {COMPANY_INFO.address}, {COMPANY_INFO.city}</p>
                                    <p style={{ margin: '0', fontSize: '10px', lineHeight: '1.2' }}>Telp: {COMPANY_INFO.phone} | Email: {COMPANY_INFO.email}</p>
                                </div>
                                <div style={{ width: '120px', textAlign: 'right' }}>
                                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#333' }}>INVOICE</h2>
                                    <p style={{ margin: '0', fontSize: '10px', fontWeight: 'bold' }}>No: {`INV-${invoiceData.jamaah.id.substring(0, 8).toUpperCase()}`}</p>
                                    <p style={{ margin: '0', fontSize: '10px' }}>Tgl: {invoiceDate}</p>
                                </div>
                            </div>

                            {/* Details */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '10px' }}>
                                <div style={{ width: '55%' }}>
                                    <table style={{ width: '100%' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ width: '90px', padding: '1px 0' }}>Kepada Yth</td>
                                                <td style={{ padding: '1px 0' }}>: {invoiceData.jamaah.nama}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: '1px 0' }}>HP/Tlp</td>
                                                <td style={{ padding: '1px 0' }}>: {invoiceData.jamaah.phone}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: '1px 0' }}>Alamat</td>
                                                <td style={{ padding: '1px 0' }}>: {invoiceData.jamaah.address}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ width: '40%' }}>
                                    <table style={{ width: '100%' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ width: '100px', padding: '1px 0' }}>Paket</td>
                                                <td style={{ padding: '1px 0' }}>: {invoiceData.jamaah.paket}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: '1px 0' }}>Tgl. Keberangkatan</td>
                                                <td style={{ padding: '1px 0' }}>: {invoiceData.jamaah.tanggalKeberangkatan || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <p style={{ fontSize: '10px', marginBottom: '5px', fontStyle: 'italic' }}>Telah diterima Pembayaran dengan rincian sebagai berikut :</p>

                            {/* Table */}
                            <div style={{ flex: 1 }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '10px' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                                            <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', width: '30px' }}>NO</th>
                                            <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', width: '80px' }}>Tanggal</th>
                                            <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>Keterangan</th>
                                            <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', width: '90px' }}>Diskon</th>
                                            <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', width: '100px' }}>Jumlah IDR</th>
                                            <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', width: '90px' }}>Metode Bayar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceData.payments.map((payment, index) => (
                                            <tr key={index}>
                                                <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{payment.no}</td>
                                                <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{payment.tanggal}</td>
                                                <td style={{ border: '1px solid #000', padding: '3px' }}>
                                                    {payment.jenis}
                                                    {payment.notes && <span style={{ fontSize: '9px', display: 'block', color: '#555' }}><i>{payment.notes}</i></span>}
                                                </td>
                                                <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'right' }}>
                                                    {payment.discount > 0 ? formatCurrency(payment.discount) : '-'}
                                                </td>
                                                <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'right' }}>{formatCurrency(payment.amount)}</td>
                                                <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod}</td>
                                            </tr>
                                        ))}
                                        {[...Array(Math.max(0, 3 - invoiceData.payments.length))].map((_, i) => (
                                            <tr key={`empty-${i}`}>
                                                <td style={{ border: '1px solid #000', padding: '3px' }}>&nbsp;</td>
                                                <td style={{ border: '1px solid #000', padding: '3px' }}>&nbsp;</td>
                                                <td style={{ border: '1px solid #000', padding: '3px' }}>&nbsp;</td>
                                                <td style={{ border: '1px solid #000', padding: '3px' }}>&nbsp;</td>
                                                <td style={{ border: '1px solid #000', padding: '3px' }}>&nbsp;</td>
                                                <td style={{ border: '1px solid #000', padding: '3px' }}>&nbsp;</td>
                                            </tr>
                                        ))}
                                        {/* Total Row */}
                                        <tr style={{ fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
                                            <td colSpan="3" style={{ border: '1px solid #000', padding: '3px', textAlign: 'right' }}>Total</td>
                                            <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'right' }}>{invoiceData.totalDiscount > 0 ? formatCurrency(invoiceData.totalDiscount) : '-'}</td>
                                            <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'right' }}>{formatCurrency(invoiceData.jamaah.dibayar)}</td>
                                            <td style={{ border: '1px solid #000', padding: '3px' }}></td>
                                        </tr>
                                        <tr style={{ fontWeight: 'bold' }}>
                                            <td colSpan="4" style={{ border: '1px solid #000', padding: '3px', textAlign: 'right' }}>Sisa Pembayaran</td>
                                            <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'right' }}>{formatCurrency(invoiceData.jamaah.sisa)}</td>
                                            <td style={{ border: '1px solid #000', padding: '3px' }}></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Signatures */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '10px' }}>
                                <div style={{ textAlign: 'center', width: '30%' }}>
                                    <p style={{ marginBottom: '60px' }}>{COMPANY_INFO.city}, {invoiceDate}<br />Yang Menyerahkan</p>
                                    <p style={{ fontWeight: 'bold' }}>{invoiceData.sender || '(....................)'}</p>
                                </div>
                                <div style={{ textAlign: 'center', width: '30%' }}>
                                    <p style={{ marginBottom: '60px' }}>&nbsp;<br />Yang Menerima</p>
                                    <p style={{ fontWeight: 'bold' }}>{invoiceData.receiver || '(....................)'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Main UI */}
            <div className={`space-y-6 animate-fade-in ${showPrintView ? 'no-print' : ''}`}>
                <div className="page-header">
                    <h1 className="page-title">Invoice Generator</h1>
                    <p className="text-sm text-gray-500 mt-1">Generate invoice pembayaran jamaah</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Jamaah List */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="space-y-3">
                            {/* Text Search */}
                            <Input
                                placeholder="Cari nama jamaah..."
                                icon={<Search className="w-4 h-4" />}
                                value={searchQuery}
                                onChange={(e) => setSearchJamaahQuery(e.target.value)}
                            />

                            {/* Package Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Filter Paket</label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                                    <select
                                        value={filterPackageId}
                                        onChange={(e) => setFilterPackageId(e.target.value)}
                                        className="w-full pl-9 pr-8 py-2 bg-emerald-700 border border-emerald-600 rounded-lg text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                    >
                                        <option value="">Semua Paket</option>
                                        {packagesData?.data?.map(pkg => (
                                            <option key={pkg.id} value={pkg.id}>
                                                {pkg.name} - {pkg.departureDate ? new Date(pkg.departureDate).toLocaleDateString('id-ID') : 'N/A'}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                                </div>
                            </div>

                            {/* Departure Date Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Tanggal Keberangkatan</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="date"
                                        value={filterDepartureDate}
                                        onChange={(e) => setFilterDepartureDate(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-surface-glass border border-surface-border rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {(filterPackageId || filterDepartureDate) && (
                                <button
                                    onClick={() => {
                                        setFilterPackageId('');
                                        setFilterDepartureDate('');
                                    }}
                                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" />
                                    Hapus Filter
                                </button>
                            )}
                        </Card>

                        {/* Batch Controls */}
                        {selectedBatchIds.size > 0 && (
                            <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3 flex items-center justify-between">
                                <span className="text-sm font-medium text-primary-400">
                                    {selectedBatchIds.size} dipilih
                                </span>
                                <Button
                                    size="xs"
                                    variant="primary"
                                    onClick={handlePrepareBatchPrint}
                                    icon={<Printer className="w-3 h-3" />}
                                >
                                    Cetak ({selectedBatchIds.size})
                                </Button>
                            </div>
                        )}

                        <Card className="!p-0 flex flex-col max-h-[600px]">
                            {/* List Header */}
                            <div className="p-4 border-b border-surface-border flex items-center gap-3">
                                <button
                                    onClick={handleToggleSelectAll}
                                    className="text-gray-400 hover:text-white transition-colors"
                                    title={isAllSelected ? "Batal Pilih Semua" : "Pilih Semua"}
                                >
                                    {isAllSelected ? (
                                        <CheckSquare className="w-5 h-5 text-primary-500" />
                                    ) : (
                                        <Square className="w-5 h-5" />
                                    )}
                                </button>
                                <span className="text-sm font-medium text-white">Daftar Jamaah</span>
                            </div>

                            <div className="divide-y divide-surface-border overflow-y-auto flex-1">
                                {jamaahLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
                                    </div>
                                ) : filteredData.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Tidak ada jamaah ditemukan</p>
                                    </div>
                                ) : (
                                    filteredData.map((jamaah) => {
                                        const isSelected = selectedBatchIds.has(jamaah.id);
                                        const isActive = selectedJamaahId === jamaah.id;

                                        return (
                                            <div
                                                key={jamaah.id}
                                                className={`w-full p-4 flex gap-3 hover:bg-surface-glass transition-colors cursor-pointer ${isActive ? 'bg-surface-glass' : ''}`}
                                                onClick={() => handleSelectJamaah(jamaah)}
                                            >
                                                <button
                                                    onClick={(e) => handleToggleSelect(e, jamaah.id)}
                                                    className="mt-1 flex-shrink-0 text-gray-400 hover:text-primary-400"
                                                >
                                                    {isSelected ? (
                                                        <CheckSquare className="w-5 h-5 text-primary-500" />
                                                    ) : (
                                                        <Square className="w-5 h-5" />
                                                    )}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className={`font-medium truncate ${isActive ? 'text-primary-400' : 'text-white'}`}>
                                                            {jamaah.nama}
                                                        </p>
                                                        {getStatusBadge(jamaah.status)}
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">{jamaah.paket}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Invoice Preview */}
                    <div className="lg:col-span-2">
                        {selectedJamaah ? (
                            <div className="space-y-4">
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

                                <Card className="!p-0">
                                    <div className="p-6 border-b border-surface-border">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-white">KWITANSI</h2>
                                                <p className="text-sm text-gray-500">{`INV-${selectedJamaah.id.substring(0, 8).toUpperCase()}`}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    icon={<FileSpreadsheet className="w-4 h-4" />}
                                                    onClick={handleExportCSV}
                                                >
                                                    Export CSV
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    icon={<Printer className="w-4 h-4" />}
                                                    onClick={handlePrintSingle}
                                                >
                                                    Print Preview
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    icon={<Download className="w-4 h-4" />}
                                                    onClick={handlePrintSingle}
                                                >
                                                    Print / PDF
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {/* Preview Content (Same as before but using singleJamaahPayments) */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Dari</p>
                                                <div className="flex items-start gap-2">
                                                    <Building2 className="w-4 h-4 text-primary-400 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-white">{COMPANY_INFO.name}</p>
                                                        <p className="text-sm text-gray-400">{COMPANY_INFO.address}</p>
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

                                        {/* Payments List Preview */}
                                        <div>
                                            <p className="text-sm font-medium text-gray-400 mb-3">Riwayat Pembayaran</p>
                                            <div className="space-y-2">
                                                {paymentsLoading ? (
                                                    <div className="flex items-center justify-center py-4">
                                                        <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
                                                    </div>
                                                ) : singleJamaahPayments.length === 0 ? (
                                                    <p className="text-gray-500 text-sm py-2">Belum ada riwayat pembayaran</p>
                                                ) : (
                                                    singleJamaahPayments.map(payment => (
                                                        <div key={payment.id} className="flex items-center justify-between py-2 border-b border-surface-border">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${payment.paymentMethod === 'transfer' ? 'bg-blue-500/20' : 'bg-emerald-500/20'}`}>
                                                                    {payment.paymentMethod === 'transfer' ? <CreditCard className="w-4 h-4 text-blue-400" /> : <Wallet className="w-4 h-4 text-emerald-400" />}
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

                                        <div className="bg-dark-tertiary/50 rounded-xl p-4 space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400">Total Harga</span>
                                                <span className="text-white">{formatCurrency(selectedJamaah.harga)}</span>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-surface-border">
                                                <span className="font-medium text-white">Sisa Pembayaran</span>
                                                <span className={`font-bold text-lg ${selectedJamaah.sisa > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                    {formatCurrency(selectedJamaah.sisa)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ) : (
                            <Card>
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-surface-glass rounded-2xl flex items-center justify-center">
                                        <Printer className="w-8 h-8 text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-2">Invoice Generator</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto">
                                        Pilih jamaah dari daftar di samping untuk melihat preview.
                                        Gunakan checkbox untuk mencetak banyak invoice sekaligus.
                                    </p>
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
