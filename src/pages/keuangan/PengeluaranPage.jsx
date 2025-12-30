import React, { useState } from 'react';
import { Search, Plus, ArrowDownRight, ChevronLeft, ChevronRight, Loader2, Trash2, Edit2, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Badge from '../../components/atoms/Badge';
import { formatCurrency } from '../../utils/formatters';
import { useExpenseTransactions, useDeleteTransaction } from '../../hooks/useTransactions';
import { AddExpenseModal, EditExpenseModal } from '../../components/modals';
import { formatDateToID } from '../../utils/dateUtils';

const PengeluaranPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    // Build query params
    const queryParams = {
        page: currentPage,
        limit,
        ...(filterCategory !== 'all' && { expenseCategory: filterCategory }),
    };

    // Fetch data from API
    const { data: expenseData, isLoading, isError, error, refetch } = useExpenseTransactions(queryParams);
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

    // Extract data with fallbacks
    const transactions = expenseData?.data || [];
    const pagination = expenseData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

    // Filter locally for search
    const filteredData = transactions.filter(item => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return (
            (item.vendorName || '').toLowerCase().includes(searchLower) ||
            (item.packageName || item.packageCode || '').toLowerCase().includes(searchLower) ||
            (item.description || '').toLowerCase().includes(searchLower)
        );
    });

    const totalExpense = filteredData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const categories = [
        { value: 'all', label: 'Semua' },
        { value: 'tiket_pesawat', label: 'Tiket Pesawat' },
        { value: 'hotel', label: 'Hotel' },
        { value: 'transport', label: 'Transport' },
        { value: 'visa', label: 'Visa' },
        { value: 'handling', label: 'Handling' },
        { value: 'muthawif', label: 'Muthawif' },
        { value: 'konsumsi', label: 'Konsumsi' },
        { value: 'lainnya', label: 'Lainnya' },
    ];

    const getCategoryBadge = (kategori) => {
        const config = {
            tiket_pesawat: { variant: 'info', label: 'Tiket Pesawat' },
            hotel: { variant: 'primary', label: 'Hotel' },
            transport: { variant: 'warning', label: 'Transport' },
            visa_handling: { variant: 'neutral', label: 'Visa & Handling' },
            visa: { variant: 'neutral', label: 'Visa' },
            handling: { variant: 'success', label: 'Handling' },
            muthawif: { variant: 'success', label: 'Muthawif' },
            konsumsi: { variant: 'success', label: 'Konsumsi' },
            lainnya: { variant: 'neutral', label: 'Lainnya' },
        };
        const cat = config[kategori] || { variant: 'neutral', label: kategori || 'Lainnya' };
        return <Badge variant={cat.variant}>{cat.label}</Badge>;
    };

    const handleFilterChange = (value) => {
        setFilterCategory(value);
        setCurrentPage(1);
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
                            onClick={() => {
                                setFilterCategory('all');
                                setCurrentPage(1);
                            }}
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
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Pengeluaran</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola transaksi pengeluaran ke vendor</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
                    Tambah Pengeluaran
                </Button>
            </div>

            {/* Summary Card */}
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
                            {isLoading ? '...' : `${filteredData.length} transaksi`}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Filters */}
            <Card>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari vendor atau paket..."
                            icon={<Search className="w-4 h-4" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {categories.slice(0, 5).map((cat) => (
                            <Button
                                key={cat.value}
                                variant={filterCategory === cat.value ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => handleFilterChange(cat.value)}
                            >
                                {cat.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Data Table */}
            <Card>
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
                            <table className="table-dark w-full">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Tanggal
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Vendor
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Paket
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Kategori
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Keterangan
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Jumlah
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-border">
                                    {filteredData.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-glass transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {item.transactionDate
                                                    ? formatDateToID(item.transactionDate)
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                {item.vendorName || '-'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="px-2 py-0.5 text-xs font-medium bg-surface-glass rounded text-gray-400">
                                                    {item.packageName || item.packageCode || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {getCategoryBadge(item.expenseCategory)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-400">
                                                {item.description || item.notes || '-'}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="font-tabular font-semibold text-rose-400">
                                                    -{formatCurrency(parseFloat(item.amount) || 0)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="!p-2"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="!p-2 text-rose-400 hover:text-rose-300"
                                                        onClick={() => handleDelete(item)}
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-border">
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
        </div>
    );
};

export default PengeluaranPage;
