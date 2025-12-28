import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Users, Phone, MapPin, ChevronRight, ChevronLeft, Loader2, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Badge from '../../components/atoms/Badge';
import { formatCurrency } from '../../utils/formatters';
import { useJamaahList, useJamaahStats, useDeleteJamaah } from '../../hooks/useJamaah';

const JamaahList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    // Build query params
    const queryParams = {
        page: currentPage,
        limit,
        ...(searchQuery && { search: searchQuery }),
        ...(filterStatus !== 'all' && { paymentStatus: filterStatus }),
    };

    // Fetch data from API
    const { data: jamaahData, isLoading, error } = useJamaahList(queryParams);
    const { data: statsData, isLoading: statsLoading } = useJamaahStats();
    const deleteMutation = useDeleteJamaah({
        onSuccess: () => {
            toast.success('Jamaah berhasil dihapus');
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal menghapus jamaah');
        },
    });

    const handleDelete = (jamaah) => {
        if (window.confirm(`Yakin ingin menghapus jamaah "${jamaah.name}"?`)) {
            deleteMutation.mutate(jamaah.id);
        }
    };

    // Extract data with fallbacks
    const jamaahList = jamaahData?.data || [];
    const pagination = jamaahData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

    // Convert countByStatus array to object format
    const rawStats = statsData?.data || {};
    const countByStatusArray = rawStats.countByStatus || [];
    const countByStatus = Array.isArray(countByStatusArray)
        ? countByStatusArray.reduce((acc, item) => {
            acc[item.status] = item.count;
            return acc;
        }, { lunas: 0, pending: 0, dp: 0, cicilan: 0, dibatalkan: 0 })
        : countByStatusArray;

    const stats = {
        countByStatus,
        totalPiutang: rawStats.totalPiutang || 0,
        activeCount: rawStats.activeCount || 0,
    };

    const totalJamaah = (stats.countByStatus?.lunas || 0) + (stats.countByStatus?.pending || 0) + (stats.countByStatus?.dp || 0) + (stats.countByStatus?.cicilan || 0);

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

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        setCurrentPage(1); // Reset to first page on filter change
    };

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="!p-6 max-w-md">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-4 bg-rose-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-rose-400 text-2xl">!</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Gagal Memuat Data</h3>
                        <p className="text-gray-400 text-sm">{error.message || 'Terjadi kesalahan saat memuat data jamaah'}</p>
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
                    <h1 className="page-title">Data Jamaah</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola data jamaah umrah dan haji</p>
                </div>
                <Link to="/jamaah/baru">
                    <Button icon={<Plus className="w-4 h-4" />}>
                        Tambah Jamaah
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            {statsLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            ) : (
                                <>
                                    <p className="text-2xl font-bold text-white">{totalJamaah}</p>
                                    <p className="text-xs text-gray-500">Total Jamaah</p>
                                </>
                            )}
                        </div>
                    </div>
                </Card>
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            {statsLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            ) : (
                                <>
                                    <p className="text-2xl font-bold text-white">{stats.activeCount || 0}</p>
                                    <p className="text-xs text-gray-500">Jamaah Aktif</p>
                                </>
                            )}
                        </div>
                    </div>
                </Card>
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            {statsLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            ) : (
                                <>
                                    <p className="text-2xl font-bold text-white">{stats.countByStatus?.pending || 0}</p>
                                    <p className="text-xs text-gray-500">Belum Lunas</p>
                                </>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari nama, NIK, atau telepon..."
                            icon={<Search className="w-4 h-4" />}
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={filterStatus === 'all' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleFilterChange('all')}
                        >
                            Semua
                        </Button>
                        <Button
                            variant={filterStatus === 'lunas' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleFilterChange('lunas')}
                        >
                            Lunas
                        </Button>
                        <Button
                            variant={filterStatus === 'pending' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleFilterChange('pending')}
                        >
                            Belum Lunas
                        </Button>
                        <Button
                            variant={filterStatus === 'dp' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleFilterChange('dp')}
                        >
                            DP
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Data Table */}
            <Card>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-3" />
                            <p className="text-gray-400">Memuat data jamaah...</p>
                        </div>
                    </div>
                ) : jamaahList.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Tidak ada data</h3>
                        <p className="text-gray-500">
                            {searchQuery || filterStatus !== 'all'
                                ? 'Tidak ditemukan jamaah dengan kriteria pencarian'
                                : 'Belum ada data jamaah'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto -mx-6 px-6">
                            <table className="table-dark w-full">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Jamaah
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Kontak
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Paket
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Sisa Bayar
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-border">
                                    {jamaahList.map((jamaah) => {
                                        const totalAmount = parseFloat(jamaah.totalAmount) || 0;
                                        const paidAmount = parseFloat(jamaah.paidAmount) || 0;
                                        const sisaBayar = totalAmount - paidAmount;

                                        return (
                                            <tr key={jamaah.id} className="hover:bg-surface-glass transition-colors">
                                                <td className="px-4 py-4">
                                                    <div>
                                                        <p className="font-medium text-white">{jamaah.name}</p>
                                                        <p className="text-xs text-gray-500">NIK: {jamaah.nik || '-'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="flex items-center gap-1 text-sm text-gray-300">
                                                            <Phone className="w-3 h-3 text-gray-500" />
                                                            {jamaah.phone || '-'}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                                            <MapPin className="w-3 h-3" />
                                                            {jamaah.address || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-surface-glass rounded text-gray-400">
                                                        {jamaah.package?.name || jamaah.packageName || jamaah.package?.code || jamaah.packageCode || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {getStatusBadge(jamaah.paymentStatus || 'dp')}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className={`font-tabular font-semibold ${sisaBayar > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                        {formatCurrency(sisaBayar)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Link to={`/jamaah/${jamaah.id}`}>
                                                            <Button variant="ghost" size="sm" className="!p-2">
                                                                <Edit2 className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="!p-2 text-rose-400 hover:text-rose-300"
                                                            onClick={() => handleDelete(jamaah)}
                                                            disabled={deleteMutation.isPending}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-border">
                            <p className="text-sm text-gray-500">
                                Menampilkan {jamaahList.length} dari {pagination.total} data
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
        </div>
    );
};

export default JamaahList;
