import React, { useState, useMemo } from 'react';
import { Search, Plus, ArrowUpRight, ChevronLeft, ChevronRight, Loader2, Trash2, AlertCircle, RefreshCw, Wallet, CreditCard, Eye, Edit, Printer, FileText, Download, Filter, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Badge from '../../components/atoms/Badge';
import { formatCurrency } from '../../utils/formatters';
import { useIncomeTransactions, useDeleteTransaction } from '../../hooks/useTransactions';
import { usePackages } from '../../hooks/usePackages';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/atoms/Table';
import { AddIncomeModal, EditIncomeModal, ViewIncomeModal, ImageModal } from '../../components/modals';
import { formatDateToID } from '../../utils/dateUtils';
import { transactionService } from '../../services/api/index';

const PemasukanPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterPackage, setFilterPackage] = useState('all');
    const [filterDepartureDate, setFilterDepartureDate] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    // Build query params
    const queryParams = {
        page: currentPage,
        limit,
        ...(filterCategory !== 'all' && { incomeCategory: filterCategory }),
        ...(filterPackage !== 'all' && { packageId: filterPackage }),
        ...(searchQuery && { search: searchQuery }),
    };

    // Fetch data from API
    const { data: incomeData, isLoading, isError, error, refetch } = useIncomeTransactions(queryParams);
    const { data: packagesData } = usePackages({ limit: 100 });

    const deleteMutation = useDeleteTransaction({
        onSuccess: () => {
            toast.success('Transaksi berhasil dihapus');
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal menghapus transaksi');
        },
    });

    const handleDelete = (item) => {
        if (window.confirm(`Yakin ingin menghapus transaksi ini?`)) {
            deleteMutation.mutate(item.id);
        }
    };

    const handleEdit = (item) => {
        setSelectedTransaction(item);
        setShowEditModal(true);
    };

    const handleView = (item) => {
        setSelectedTransaction(item);
        setShowViewModal(true);
    };

    const handleViewImage = (url) => {
        setSelectedImageUrl(url);
        setShowImageModal(true);
    };

    // Extract data with fallbacks
    const transactions = incomeData?.data || [];
    const pagination = incomeData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
    const packagesList = packagesData?.data || [];

    // Filter locally - primarily for Departure Date
    const filteredData = useMemo(() => {
        let result = transactions;

        // Search fallback (if backend filtering fails or isn't used)
        if (searchQuery && !queryParams.search) {
            const searchLower = searchQuery.toLowerCase();
            result = result.filter(item => {
                const jamaahName = item.jamaah?.name || '';
                const packageName = item.package?.packageName || item.package?.name || '';
                const description = item.description || item.notes || '';
                return (
                    jamaahName.toLowerCase().includes(searchLower) ||
                    packageName.toLowerCase().includes(searchLower) ||
                    description.toLowerCase().includes(searchLower)
                );
            });
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

    const totalIncome = filteredData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const categories = [
        { value: 'all', label: 'Semua' },
        { value: 'dp', label: 'DP' },
        { value: 'cicilan', label: 'Cicilan' },
        { value: 'pelunasan', label: 'Pelunasan' },
        { value: 'lainnya', label: 'Lainnya' },
    ];

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

    const getPaymentMethodBadge = (method) => {
        if (method === 'cash') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                    <Wallet className="w-3 h-3" />
                    Cash
                </span>
            );
        } else if (method === 'transfer') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium">
                    <CreditCard className="w-3 h-3" />
                    Transfer
                </span>
            );
        }
        return <span className="text-gray-500 text-xs">-</span>;
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
                <td>${item.jamaah?.name || '-'}</td>
                <td>${item.package?.packageName || item.package?.name || '-'}</td>
                <td>${item.incomeCategory}</td>
                <td>${item.paymentMethod}</td>
                <td>${item.description || '-'}</td>
                <td style="text-align: right;">${formatCurrency(parseFloat(item.amount) || 0)}</td>
            </tr>
        `).join('');

        // Create print window content
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Laporan Pemasukan</title>
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
                <h1>Laporan Pemasukan</h1>
                <p class="subtitle">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} | Total: ${data.length} transaksi | Total Jumlah: ${formatCurrency(data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0))}</p>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;">No</th>
                            <th>Tanggal</th>
                            <th>Jamaah</th>
                            <th>Paket</th>
                            <th>Kategori</th>
                            <th>Metode</th>
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
            const exportParams = {
                ...queryParams,
                limit: 10000,
                page: 1
            };
            const response = await transactionService.getIncome(exportParams);
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

        const headers = ['Tanggal', 'Jamaah', 'Paket', 'Kategori', 'Metode', 'Jumlah', 'Keterangan'];
        const csvContent = [
            headers.join(','),
            ...data.map(item => [
                item.transactionDate ? formatDateToID(item.transactionDate) : '-',
                `"${item.jamaah?.name || '-'}"`,
                `"${item.package?.packageName || item.package?.name || '-'}"`,
                item.incomeCategory,
                item.paymentMethod,
                parseFloat(item.amount) || 0,
                `"${(item.description || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `pemasukan_${new Date().toISOString().split('T')[0]}.csv`);
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
                    <p className="text-gray-400 mb-6">{error?.message || 'Terjadi kesalahan saat memuat data pemasukan'}</p>
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
            <div className="page-header flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Pemasukan</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola transaksi pemasukan dari jamaah</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    <Button variant="outline" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
                        Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportCSV} icon={<FileText className="w-4 h-4" />}>
                        CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportPDF} icon={<Download className="w-4 h-4" />}>
                        PDF
                    </Button>
                    <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)} className="flex-1 lg:flex-none">
                        Tambah Pemasukan
                    </Button>
                </div>
            </div>

            {/* Summary Card - Hide on Print */}
            <div className="print:hidden">
                <Card className="!p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                                ) : (
                                    <ArrowUpRight className="w-6 h-6 text-emerald-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Total Pemasukan</p>
                                <p className="text-2xl font-bold text-emerald-400">
                                    {isLoading ? '...' : formatCurrency(totalIncome)}
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

            {/* Filters - Hide on Print */}
            <div className="print:hidden">
                <Card>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Cari nama jamaah atau paket..."
                                    icon={<Search className="w-4 h-4" />}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap items-center">
                                {categories.map((cat) => (
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-dark-tertiary/30 rounded-xl border border-surface-border animate-slide-down">
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
                                <div className="flex justify-end items-end md:col-span-2 lg:col-span-1">
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
                            <p className="text-gray-400">Memuat data pemasukan...</p>
                        </div>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-12">
                        <ArrowUpRight className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Tidak ada data</h3>
                        <p className="text-gray-500">Belum ada transaksi pemasukan</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto -mx-6 px-6">
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th>Tanggal</Th>
                                        <Th>Jamaah</Th>
                                        <Th>Paket</Th>
                                        <Th>Kategori</Th>
                                        <Th>Metode</Th>
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
                                                {item.jamaah?.name || '-'}
                                            </Td>
                                            <Td>
                                                <span className="px-2 py-0.5 text-xs font-medium bg-surface-glass rounded text-gray-400">
                                                    {item.package?.packageName || item.package?.name || item.packageCode || '-'}
                                                </span>
                                            </Td>
                                            <Td className="whitespace-nowrap">
                                                {getCategoryBadge(item.incomeCategory)}
                                            </Td>
                                            <Td className="whitespace-nowrap">
                                                {getPaymentMethodBadge(item.paymentMethod)}
                                            </Td>
                                            <Td align="right">
                                                <span className="font-tabular font-semibold text-emerald-400">
                                                    +{formatCurrency(parseFloat(item.amount) || 0)}
                                                </span>
                                            </Td>
                                            <Td align="center" className="print:hidden">
                                                <div className="flex items-center justify-center gap-2">
                                                    {(item.receiptUrl && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="!p-2 text-primary-400 hover:text-primary-300"
                                                            onClick={() => handleViewImage(item.receiptUrl)}
                                                            title="Bukti"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </Button>
                                                    )) || ((
                                                        <span className="w-8 h-8 flex items-center justify-center">
                                                            <span className="text-gray-600 text-xs">-</span>
                                                        </span>
                                                    ))}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="!p-2 text-blue-400 hover:text-blue-300"
                                                        onClick={() => handleView(item)}
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="!p-2 text-warning-400 hover:text-warning-300"
                                                        onClick={() => handleEdit(item)}
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
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

            {/* Modals */}
            <AddIncomeModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
            />

            <EditIncomeModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedTransaction(null);
                }}
                initialData={selectedTransaction}
            />

            <ViewIncomeModal
                isOpen={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setSelectedTransaction(null);
                }}
                data={selectedTransaction}
            />

            <ImageModal
                isOpen={showImageModal}
                onClose={() => {
                    setShowImageModal(false);
                    setSelectedImageUrl(null);
                }}
                imageUrl={selectedImageUrl}
            />
        </div>
    );
};

export default PemasukanPage;
