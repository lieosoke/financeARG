import React, { useState, useMemo } from 'react';
import { Search, Plus, ArrowDownRight, ChevronLeft, ChevronRight, Loader2, Trash2, Edit2, AlertCircle, RefreshCw, Printer, FileText, Download, Eye, Filter, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Badge from '../../components/atoms/Badge';
import { formatCurrency } from '../../utils/formatters';
import { useExpenseTransactions, useDeleteTransaction } from '../../hooks/useTransactions';
import { usePackages } from '../../hooks/usePackages'; // Import usePackages
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/atoms/Table';
import { AddExpenseModal, EditExpenseModal, ViewExpenseModal } from '../../components/modals';
import { formatDateToID } from '../../utils/dateUtils';
import { transactionService } from '../../services/api/index'; // Import service for export

const PengeluaranPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterPackage, setFilterPackage] = useState('all');
    const [filterDepartureDate, setFilterDepartureDate] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    // Build query params
    const queryParams = {
        page: currentPage,
        limit,
        ...(filterCategory !== 'all' && { expenseCategory: filterCategory }),
        ...(filterPackage !== 'all' && { packageId: filterPackage }),
        // We pass search query to backend if possible, usually it's supported
        ...(searchQuery && { search: searchQuery }),
    };

    // Fetch data from API
    const { data: expenseData, isLoading, isError, error, refetch } = useExpenseTransactions(queryParams);
    const { data: packagesData } = usePackages({ limit: 100 }); // Fetch packages

    const deleteMutation = useDeleteTransaction({
        onSuccess: () => {
            toast.success('Transaksi berhasil dihapus');
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal menghapus transaksi');
        },
    });

    const handleDelete = (item) => {
        if (window.confirm(`Yakin ingin menghapus transaksi ini ? `)) {
            deleteMutation.mutate(item.id);
        }
    };

    const handleEdit = (item) => {
        setSelectedExpense(item);
        setShowEditModal(true);
    };

    const handleView = (item) => {
        setSelectedExpense(item);
        setShowViewModal(true);
    };

    // Extract data with fallbacks
    const transactions = expenseData?.data || [];
    const pagination = expenseData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
    const packagesList = packagesData?.data || [];

    // Filter locally for whatever isn't handled by backend (safeguard) + Departure Date
    const filteredData = useMemo(() => {
        let result = transactions;

        // Note: Basic search and category are best handled by backend via queryParams.
        // If queryParams doesn't support 'search', we filter here as fallback.
        if (searchQuery && !queryParams.search) { // only if we didn't pass it to backend
            const searchLower = searchQuery.toLowerCase();
            result = result.filter(item =>
                (item.vendor?.name || item.vendorName || '').toLowerCase().includes(searchLower) ||
                (item.package?.name || item.packageName || item.packageCode || '').toLowerCase().includes(searchLower) ||
                (item.description || '').toLowerCase().includes(searchLower)
            );
        }

        // Filter by departure date
        if (filterDepartureDate) {
            result = result.filter(item => {
                if (!item.package?.departureDate) return false;
                const date = new Date(item.package.departureDate);
                if (isNaN(date.getTime())) return false;
                const depDate = date.toISOString().slice(0, 10);
                return depDate === filterDepartureDate;
            });
        }

        return result;
    }, [transactions, searchQuery, filterDepartureDate, queryParams.search]);

    const totalExpense = filteredData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const categories = [
        { value: 'all', label: 'Semua' },
        { value: 'tiket_pesawat', label: 'Tiket Pesawat' },
        { value: 'hotel', label: 'Hotel' },
        { value: 'hotel_transit', label: 'Hotel Transit' },
        { value: 'transport', label: 'Transport' },
        { value: 'visa', label: 'Visa' },
        { value: 'handling', label: 'Handling' },
        { value: 'muthawif', label: 'Muthawif' },
        { value: 'konsumsi', label: 'Konsumsi' },
        { value: 'manasik', label: 'Manasik' },
        { value: 'ujroh', label: 'Ujroh' },
        { value: 'lainnya', label: 'Lainnya' },
    ];

    const getCategoryBadge = (kategori) => {
        const config = {
            tiket_pesawat: { variant: 'info', label: 'Tiket Pesawat' },
            hotel: { variant: 'primary', label: 'Hotel' },
            hotel_transit: { variant: 'primary', label: 'Hotel Transit' },
            transport: { variant: 'warning', label: 'Transport' },
            visa_handling: { variant: 'neutral', label: 'Visa & Handling' },
            visa: { variant: 'neutral', label: 'Visa' },
            handling: { variant: 'success', label: 'Handling' },
            muthawif: { variant: 'success', label: 'Muthawif' },
            konsumsi: { variant: 'success', label: 'Konsumsi' },
            manasik: { variant: 'info', label: 'Manasik' },
            ujroh: { variant: 'warning', label: 'Ujroh' },
            lainnya: { variant: 'neutral', label: 'Lainnya' },
        };
        const cat = config[kategori] || { variant: 'neutral', label: kategori || 'Lainnya' };
        return <Badge variant={cat.variant}>{cat.label}</Badge>;
    };

    const handleFilterChange = (value) => {
        setFilterCategory(value);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setFilterCategory('all');
        setFilterPackage('all');
        setFilterDepartureDate('');
        setCurrentPage(1);
    };

    // --- Export Functions ---

    const handlePrint = async () => {
        const data = await fetchAllDataForExport();
        if (!data.length) {
            toast.error('Tidak ada data untuk dicetak');
            return;
        }

        // Generate table rows
        const tableRows = data.map((item, index) => `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td>${item.transactionDate ? formatDateToID(item.transactionDate) : '-'}</td>
                <td>${item.vendor?.name || item.vendorName || '-'}</td>
                <td>${item.package?.name || item.packageName || item.packageCode || '-'}</td>
                <td>${item.expenseCategory}</td>
                <td>${item.description || item.notes || '-'}</td>
                <td style="text-align: right;">${formatCurrency(parseFloat(item.amount) || 0)}</td>
            </tr>
        `).join('');

        // Create print window content
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Laporan Pengeluaran</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; font-size: 18pt; margin-bottom: 5px; }
                    .subtitle { text-align: center; font-size: 10pt; color: #666; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; font-size: 9pt; }
                    th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
                    th { background-color: #e5e5e5; font-weight: bold; text-transform: uppercase; font-size: 8pt; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    @media print {
                        @page { size: A4 landscape; margin: 10mm; }
                    }
                </style>
            </head>
            <body>
                <h1>Laporan Pengeluaran</h1>
                <p class="subtitle">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} | Total: ${data.length} transaksi | Total Jumlah: ${formatCurrency(data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0))}</p>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;">No</th>
                            <th>Tanggal</th>
                            <th>Vendor</th>
                            <th>Paket</th>
                            <th>Kategori</th>
                            <th>Keterangan</th>
                            <th style="text-align: right;">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();

        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const fetchAllDataForExport = async () => {
        const toastId = toast.loading('Sedang menyiapkan data export...');
        try {
            // Fetch all data matching current filters
            const exportParams = {
                ...queryParams,
                limit: 10000,
                page: 1
            };
            const response = await transactionService.getExpenses(exportParams);
            toast.dismiss(toastId);
            return response.data || [];
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengambil data untuk export', { id: toastId });
            return [];
        }
    };

    const handleExportCSV = async () => {
        const data = await fetchAllDataForExport();
        if (!data.length) {
            toast.error('Tidak ada data untuk diexport');
            return;
        }

        const headers = ['Tanggal', 'Vendor', 'Paket', 'Kategori', 'Jumlah', 'Keterangan'];
        const csvContent = [
            headers.join(','),
            ...data.map(item => [
                item.transactionDate ? formatDateToID(item.transactionDate) : '-',
                `"${item.vendor?.name || item.vendorName || '-'}"`,
                `"${item.package?.name || item.packageName || item.packageCode || '-'}"`,
                item.expenseCategory,
                parseFloat(item.amount) || 0,
                `"${(item.description || item.notes || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `pengeluaran_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        handlePrint();
        toast.info('Gunakan opsi "Save as PDF" di dialog print');
    };

    // Error state
    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="!p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Gagal Memuat Data</h3>
                    <p className="text-gray-400 mb-6">{error?.message || 'Terjadi kesalahan saat memuat data pengeluaran'}</p>
                    <div className="flex gap-4 justify-center">
                        <Button
                            variant="secondary"
                            onClick={handleClearFilters}
                        >
                            Reset Filter
                        </Button>
                        <Button onClick={() => refetch()} icon={<RefreshCw className="w-4 h-4" />}>
                            Coba Lagi
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Page Header */}
            <div className="page-header flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Pengeluaran</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola transaksi pengeluaran ke vendor</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                    <Button variant="outline" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
                        Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportCSV} icon={<FileText className="w-4 h-4" />}>
                        CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportPDF} icon={<Download className="w-4 h-4" />}>
                        PDF
                    </Button>
                    <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)} className="flex-1 xl:flex-none">
                        Tambah Pengeluaran
                    </Button>
                </div>
            </div>

            {/* Summary Card - Hide on Print */}
            <div className="print:hidden">
                <Card className="!p-4 bg-gradient-to-r from-rose-500/10 to-rose-600/5 border-rose-500/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
                                ) : (
                                    <ArrowDownRight className="w-6 h-6 text-rose-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Total Pengeluaran</p>
                                <p className="text-2xl font-bold text-rose-400">
                                    {isLoading ? '...' : formatCurrency(totalExpense)}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">
                                {isLoading ? '...' : `${pagination.total} transaksi`}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="print:hidden">
                <Card>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Cari vendor atau paket..."
                                    icon={<Search className="w-4 h-4" />}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap items-center">
                                {categories.slice(0, 4).map((cat) => (
                                    <Button
                                        key={cat.value}
                                        variant={filterCategory === cat.value ? 'primary' : 'secondary'}
                                        size="sm"
                                        onClick={() => handleFilterChange(cat.value)}
                                    >
                                        {cat.label}
                                    </Button>
                                ))}
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className={`!p-2.5 ${showFilters ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' : ''}`}
                                    onClick={() => setShowFilters(!showFilters)}
                                    title="Filter Lanjutan"
                                >
                                    <Filter className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-dark-tertiary/30 rounded-xl border border-surface-border animate-slide-down">
                                <div>
                                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Kategori Lengkap</label>
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => handleFilterChange(e.target.value)}
                                        className="w-full px-3 py-2 bg-dark-tertiary border border-surface-border rounded-lg text-sm text-gray-200 focus:outline-none focus:border-primary-500"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Paket Umrah/Haji</label>
                                    <select
                                        value={filterPackage}
                                        onChange={(e) => {
                                            setFilterPackage(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-3 py-2 bg-dark-tertiary border border-surface-border rounded-lg text-sm text-gray-200 focus:outline-none focus:border-primary-500"
                                    >
                                        <option value="all">Semua Paket</option>
                                        {packagesList.map(pkg => (
                                            <option key={pkg.id} value={pkg.id}>
                                                {pkg.name} ({pkg.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Tanggal Keberangkatan</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 bg-dark-tertiary border border-surface-border rounded-lg text-sm text-gray-200 focus:outline-none focus:border-primary-500"
                                        value={filterDepartureDate}
                                        onChange={(e) => {
                                            setFilterDepartureDate(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                                <div className="md:col-span-3 flex justify-end">
                                    <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-rose-400 hover:text-rose-300">
                                        Reset Filter
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Data Table */}
            <Card className="print:shadow-none print:border-none">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-3" />
                            <p className="text-gray-400">Memuat data pengeluaran...</p>
                        </div>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-12">
                        <ArrowDownRight className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Tidak ada data</h3>
                        <p className="text-gray-500">Belum ada transaksi pengeluaran</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto -mx-6 px-6">
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th>Tanggal</Th>
                                        <Th>Vendor</Th>
                                        <Th>Paket</Th>
                                        <Th>Kategori</Th>
                                        <Th>Keterangan</Th>
                                        <Th align="right">Jumlah</Th>
                                        <Th align="center" className="print:hidden">Aksi</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredData.map((item) => (
                                        <Tr key={item.id}>
                                            <Td className="whitespace-nowrap text-sm text-gray-300">
                                                {item.transactionDate
                                                    ? formatDateToID(item.transactionDate)
                                                    : '-'}
                                            </Td>
                                            <Td className="whitespace-nowrap text-sm font-medium text-white">
                                                {item.vendor?.name || item.vendorName || '-'}
                                            </Td>
                                            <Td>
                                                <span className="px-2 py-0.5 text-xs font-medium bg-surface-glass rounded text-gray-400">
                                                    {item.package?.name || item.packageName || item.packageCode || '-'}
                                                </span>
                                            </Td>
                                            <Td className="whitespace-nowrap">
                                                {getCategoryBadge(item.expenseCategory)}
                                            </Td>
                                            <Td className="text-sm text-gray-400 max-w-xs truncate">
                                                {item.description || item.notes || '-'}
                                            </Td>
                                            <Td align="right">
                                                <span className="font-tabular font-semibold text-rose-400">
                                                    -{formatCurrency(parseFloat(item.amount) || 0)}
                                                </span>
                                            </Td>
                                            <Td align="center" className="print:hidden">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="!p-2 text-blue-400 hover:text-blue-300"
                                                        onClick={() => handleView(item)}
                                                        title="Lihat"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="!p-2"
                                                        onClick={() => handleEdit(item)}
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="!p-2 text-rose-400 hover:text-rose-300"
                                                        onClick={() => handleDelete(item)}
                                                        disabled={deleteMutation.isPending}
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </div>

                        {/* Pagination - Hide on Print */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-border print:hidden">
                            <p className="text-sm text-gray-500">
                                Menampilkan {filteredData.length} dari {pagination.total} transaksi
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-sm text-gray-400">
                                    Halaman {currentPage} dari {pagination.totalPages || 1}
                                </span>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={currentPage >= (pagination.totalPages || 1)}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </Card>
            {/* Add Expense Modal */}
            <AddExpenseModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
            />
            {/* Edit Expense Modal */}
            <EditExpenseModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedExpense(null);
                }}
                initialData={selectedExpense}
            />
            {/* View Expense Modal */}
            <ViewExpenseModal
                isOpen={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setSelectedExpense(null);
                }}
                data={selectedExpense}
            />
        </div>
    );
};

export default PengeluaranPage;
