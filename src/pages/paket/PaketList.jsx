import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Package, Calendar, Users, Plane, ChevronRight, Loader2, Trash2, Edit2, Bed } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Badge from '../../components/atoms/Badge';
import { formatCurrency } from '../../utils/formatters';
import { usePackages, useDeletePackage } from '../../hooks/usePackages';

const PaketList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 12;

    // Build query params
    const queryParams = {
        page: currentPage,
        limit,
        ...(searchQuery && { search: searchQuery }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
    };

    // Fetch data from API
    const { data: paketData, isLoading, error } = usePackages(queryParams);
    const deleteMutation = useDeletePackage({
        onSuccess: () => {
            toast.success('Paket berhasil dihapus');
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal menghapus paket');
        },
    });

    const handleDelete = (paket, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm(`Yakin ingin menghapus paket "${paket.name}"?`)) {
            deleteMutation.mutate(paket.id);
        }
    };

    // Extract data with fallbacks
    const paketList = paketData?.data || [];
    const pagination = paketData?.pagination || { total: 0 };

    // Calculate stats from the list
    const totalPaket = pagination.total || paketList.length;
    const paketAktif = paketList.filter(p => p.status === 'open' || p.status === 'ongoing').length;
    const totalSeats = paketList.reduce((acc, p) => acc + (p.totalSeats || 0), 0);
    const filledSeats = paketList.reduce((acc, p) => acc + (p.filledSeats || 0), 0);

    const getStatusBadge = (status) => {
        const statusConfig = {
            open: { variant: 'success', label: 'Open' },
            closed: { variant: 'neutral', label: 'Closed' },
            ongoing: { variant: 'info', label: 'Ongoing' },
            completed: { variant: 'primary', label: 'Completed' },
        };
        const config = statusConfig[status] || statusConfig.open;
        return <Badge variant={config.variant} dot>{config.label}</Badge>;
    };

    const getTypeBadge = (tipe) => {
        const typeConfig = {
            umroh: { variant: 'info', label: 'Umrah' },
            haji: { variant: 'primary', label: 'Haji' },
        };
        const config = typeConfig[tipe] || typeConfig.umroh;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        setCurrentPage(1);
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
                        <p className="text-gray-400 text-sm">{error.message || 'Terjadi kesalahan saat memuat data paket'}</p>
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
                    <h1 className="page-title">Manajemen Paket</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola paket umrah dan haji</p>
                </div>
                <Link to="/paket/baru">
                    <Button icon={<Plus className="w-4 h-4" />}>
                        Buat Paket Baru
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            ) : (
                                <>
                                    <p className="text-2xl font-bold text-white">{totalPaket}</p>
                                    <p className="text-xs text-gray-500">Total Paket</p>
                                </>
                            )}
                        </div>
                    </div>
                </Card>
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <Plane className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            ) : (
                                <>
                                    <p className="text-2xl font-bold text-white">{paketAktif}</p>
                                    <p className="text-xs text-gray-500">Paket Aktif</p>
                                </>
                            )}
                        </div>
                    </div>
                </Card>
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            ) : (
                                <>
                                    <p className="text-2xl font-bold text-white">{filledSeats}</p>
                                    <p className="text-xs text-gray-500">Total Jamaah</p>
                                </>
                            )}
                        </div>
                    </div>
                </Card>
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            ) : (
                                <>
                                    <p className="text-2xl font-bold text-white">{totalSeats - filledSeats}</p>
                                    <p className="text-xs text-gray-500">Seat Tersedia</p>
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
                            placeholder="Cari kode atau nama paket..."
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
                            variant={filterStatus === 'open' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleFilterChange('open')}
                        >
                            Open
                        </Button>
                        <Button
                            variant={filterStatus === 'ongoing' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleFilterChange('ongoing')}
                        >
                            Ongoing
                        </Button>
                        <Button
                            variant={filterStatus === 'closed' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleFilterChange('closed')}
                        >
                            Closed
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-3" />
                        <p className="text-gray-400">Memuat data paket...</p>
                    </div>
                </div>
            ) : paketList.length === 0 ? (
                <Card className="!py-12">
                    <div className="text-center">
                        <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Tidak ada data</h3>
                        <p className="text-gray-500">
                            {searchQuery || filterStatus !== 'all'
                                ? 'Tidak ditemukan paket dengan kriteria pencarian'
                                : 'Belum ada data paket'}
                        </p>
                    </div>
                </Card>
            ) : (
                /* Paket Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paketList.map((paket) => {
                        const terisi = paket.filledSeats || 0;
                        const kuota = paket.totalSeats || 1;
                        const occupancyPercent = Math.round((terisi / kuota) * 100);

                        return (
                            <Card key={paket.id} className="!p-0 overflow-hidden" hoverable>
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <span className="text-xs font-medium text-gray-500">{paket.code}</span>
                                            <h3 className="text-lg font-semibold text-white mt-1">{paket.name}</h3>
                                        </div>
                                        {getTypeBadge(paket.type)}
                                    </div>

                                    <div className="space-y-3 mt-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Keberangkatan
                                            </span>
                                            <span className="text-gray-300">
                                                {paket.departureDate
                                                    ? new Date(paket.departureDate).toLocaleDateString('id-ID')
                                                    : '-'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                Kuota
                                            </span>
                                            <span className="text-gray-300">{terisi}/{kuota} Jamaah</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Harga</span>
                                            <span className="text-primary-400 font-semibold">
                                                {formatCurrency(parseFloat(paket.pricePerPerson) || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-gray-500">Terisi</span>
                                            <span className="text-gray-400">{occupancyPercent}%</span>
                                        </div>
                                        <div className="h-2 bg-dark-tertiary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-300"
                                                style={{ width: `${occupancyPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-surface-border p-4 flex items-center justify-between bg-dark-tertiary/30">
                                    {getStatusBadge(paket.status)}
                                    <div className="flex items-center gap-1">
                                        <Link to={`/paket/${paket.id}/roomlist`}>
                                            <Button variant="ghost" size="sm" className="!p-2 text-indigo-400 hover:text-indigo-300" title="Room List">
                                                <Bed className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Link to={`/paket/${paket.id}`}>
                                            <Button variant="ghost" size="sm" className="!p-2">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="!p-2 text-rose-400 hover:text-rose-300"
                                            onClick={(e) => handleDelete(paket, e)}
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PaketList;
