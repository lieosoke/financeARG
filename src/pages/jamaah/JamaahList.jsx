import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Users, Phone, MapPin, ChevronRight, ChevronLeft, Loader2, Trash2, Edit2, Eye, Printer, Download, FileSpreadsheet, Filter, Calendar, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Badge from '../../components/atoms/Badge';
import { formatCurrency } from '../../utils/formatters';
import { useJamaahList, useJamaahStats, useDeleteJamaah } from '../../hooks/useJamaah';
import { usePackages } from '../../hooks/usePackages';
import { ViewJamaahModal } from '../../components/modals';

const JamaahList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPackage, setFilterPackage] = useState('all');
    const [filterDepartureDate, setFilterDepartureDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedJamaah, setSelectedJamaah] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const limit = 10;

    // ... (keep logic same)
    // Build query params
    const queryParams = {
        page: currentPage,
        limit,
        ...(searchQuery && { search: searchQuery }),
        ...(filterStatus !== 'all' && { paymentStatus: filterStatus }),
        ...(filterPackage !== 'all' && { packageId: filterPackage }),
    };

    // Fetch data from API
    const { data: jamaahData, isLoading, error } = useJamaahList(queryParams);
    const { data: statsData, isLoading: statsLoading } = useJamaahStats();
    const { data: packagesData, isLoading: packagesLoading } = usePackages({ limit: 100 });
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

    const handleView = (jamaah) => {
        setSelectedJamaah(jamaah);
        setShowViewModal(true);
    };

    // Extract data with fallbacks
    const jamaahList = jamaahData?.data || [];
    const pagination = jamaahData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

    // Stats Logic
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

    // Belum Lunas = semua jamaah yang masih punya sisa pembayaran (pending + dp + cicilan)
    const belumLunasCount = (stats.countByStatus?.pending || 0) + (stats.countByStatus?.dp || 0) + (stats.countByStatus?.cicilan || 0);


    const getStatusBadge = (status) => {
        const statusConfig = {
            lunas: { variant: 'success', label: 'Lunas', icon: <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> },
            pending: { variant: 'warning', label: 'Belum Lunas', icon: <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> },
            dp: { variant: 'info', label: 'DP', icon: <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> },
            cicilan: { variant: 'secondary', label: 'Cicilan', icon: <div className="w-1.5 h-1.5 rounded-full bg-purple-400" /> },
            dibatalkan: { variant: 'danger', label: 'Dibatalkan', icon: <div className="w-1.5 h-1.5 rounded-full bg-rose-400" /> },
        };
        const config = statusConfig[status] || statusConfig.pending;

        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.variant === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                config.variant === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    config.variant === 'info' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        config.variant === 'danger' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}>
                {config.icon}
                {config.label}
            </div>
        );
    };

    // Filter Logic
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        setCurrentPage(1);
    };

    const handlePackageFilterChange = (e) => {
        setFilterPackage(e.target.value);
        setCurrentPage(1);
    };

    const handleDepartureDateChange = (e) => {
        setFilterDepartureDate(e.target.value);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setFilterStatus('all');
        setFilterPackage('all');
        setFilterDepartureDate('');
        setCurrentPage(1);
    };

    // Export Logic
    const handleExportCSV = () => {
        if (jamaahList.length === 0) {
            toast.error('Tidak ada data untuk diekspor');
            return;
        }

        const headers = ['No', 'Nama', 'NIK', 'Telepon', 'Email', 'Alamat', 'Paket', 'Status Pembayaran', 'Total', 'Dibayar', 'Sisa'];
        const rows = filteredJamaahList.map((j, i) => [
            i + 1,
            j.name,
            j.nik || '-',
            j.phone || '-',
            j.email || '-',
            (j.address || '-').replace(/,/g, ';'),
            j.package?.name || j.packageName || '-',
            j.paymentStatus,
            parseFloat(j.totalAmount) || 0,
            parseFloat(j.paidAmount) || 0,
            parseFloat(j.remainingAmount) || 0
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `data_jamaah_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Data berhasil diekspor ke CSV');
    };

    const handlePrint = () => {
        if (jamaahList.length === 0) {
            toast.error('Tidak ada data untuk dicetak');
            return;
        }
        window.print();
    };

    const handleExportPDF = () => {
        if (jamaahList.length === 0) {
            toast.error('Tidak ada data untuk diekspor');
            return;
        }
        window.print();
        toast.info('Gunakan opsi "Save as PDF" di dialog print');
    };

    // Client-side filtering
    const filteredJamaahList = useMemo(() => {
        if (!filterDepartureDate) return jamaahList;
        return jamaahList.filter(j => {
            if (!j.package?.departureDate) return false;
            const depDate = new Date(j.package.departureDate).toISOString().slice(0, 10);
            return depDate === filterDepartureDate;
        });
    }, [jamaahList, filterDepartureDate]);

    const packagesList = packagesData?.data || [];

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
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { size: A4 landscape; margin: 15mm; }
                    .no-print, button, nav, aside { display: none !important; }
                    body * { visibility: hidden; }
                    .space-y-6, .space-y-6 * { visibility: visible; }
                    .space-y-6 { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; padding: 20px; }
                    .page-header { margin-bottom: 20px !important; }
                    .print-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
                    .print-table th, .print-table td { border: 1px solid #ccc; padding: 6px; text-align: left; color: black; }
                    .print-table th { background: #eee; font-weight: bold; }
                     /* Hide action column in print */
                     td:last-child, th:last-child { display: none !important; }
                }
            `}</style>

            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Data Jamaah</h1>
                    <p className="text-gray-400 text-sm mt-1">Kelola pendaftaran dan status pembayaran</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex gap-2">
                        <Button variant="secondary" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint} />
                        <Button variant="secondary" size="sm" icon={<FileSpreadsheet className="w-4 h-4" />} onClick={handleExportCSV} />
                    </div>
                    <Link to="/jamaah/baru">
                        <Button icon={<Plus className="w-4 h-4" />}>Jamaah Baru</Button>
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="!p-4 bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border-emerald-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <Users className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">Total Jamaah</p>
                            <h4 className="text-2xl font-bold text-white mt-0.5">{totalJamaah}</h4>
                        </div>
                    </div>
                </Card>
                <Card className="!p-4 bg-gradient-to-br from-blue-900/40 to-blue-900/10 border-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <CreditCard className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">Total Lunas</p>
                            <h4 className="text-2xl font-bold text-white mt-0.5">{stats.countByStatus?.lunas || 0}</h4>
                        </div>
                    </div>
                </Card>
                <Card className="!p-4 bg-gradient-to-br from-amber-900/40 to-amber-900/10 border-amber-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl">
                            <Loader2 className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">Belum Lunas</p>
                            <h4 className="text-2xl font-bold text-white mt-0.5">{belumLunasCount}</h4>
                        </div>
                    </div>
                </Card>
                <Card className="!p-4 bg-gradient-to-br from-purple-900/40 to-purple-900/10 border-purple-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Calendar className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">Keberangkatan</p>
                            <h4 className="text-lg font-bold text-white mt-0.5 truncate">{pagination.total} Data</h4>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters & Table Section */}
            <Card className="overflow-hidden">
                {/* Search & Toolbar */}
                <div className="p-4 border-b border-surface-border flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Cari nama, NIK, atau no hp..."
                            className="w-full pl-10 pr-4 py-2.5 bg-dark-tertiary rounded-lg border border-surface-border text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                        <div className="flex bg-dark-tertiary p-1 rounded-lg border border-surface-border">
                            {['all', 'lunas', 'pending', 'dp'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => handleFilterChange(tab)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === tab
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
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

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="p-4 bg-dark-tertiary/30 border-b border-surface-border grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-down">
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Paket Umrah/Haji</label>
                            <select
                                value={filterPackage}
                                onChange={handlePackageFilterChange}
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
                            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Bulan Keberangkatan</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 bg-dark-tertiary border border-surface-border rounded-lg text-sm text-gray-200 focus:outline-none focus:border-primary-500"
                                value={filterDepartureDate}
                                onChange={handleDepartureDateChange}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-rose-400 hover:text-rose-300">
                                Reset Filter
                            </Button>
                        </div>
                    </div>
                )}

                {/* Table Content */}
                {isLoading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Sedang memuat data jamaah...</p>
                    </div>
                ) : filteredJamaahList.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">Data Tidak Ditemukan</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Coba ubah kata kunci pencarian atau filter untuk menemukan data yang Anda cari.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full print-table no-print-borders">
                            <thead className="bg-dark-tertiary border-b border-surface-border">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Jamaah Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Kontak</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Paket</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status Pembayaran</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Sisa Tagihan</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-[100px]">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                {filteredJamaahList.map((jamaah) => {
                                    const sisaBayar = parseFloat(jamaah.remainingAmount) || 0;
                                    return (
                                        <tr key={jamaah.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-medium text-sm">
                                                        {jamaah.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors">{jamaah.name}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">NIK: {jamaah.nik || '-'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <Phone className="w-3.5 h-3.5" />
                                                        <span>{jamaah.phone || '-'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        <span className="truncate max-w-[150px]" title={jamaah.address}>{jamaah.address || '-'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-200">
                                                        {jamaah.package?.name || jamaah.packageName || '-'}
                                                    </span>
                                                    <span className="text-xs text-gray-500 mt-0.5">
                                                        {jamaah.package?.code || '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(jamaah.paymentStatus || 'dp')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`text-sm font-medium font-tabular ${sisaBayar > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                    {formatCurrency(sisaBayar)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="sm" className="!p-2 text-blue-400 hover:bg-blue-500/10" onClick={() => handleView(jamaah)}>
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Link to={`/jamaah/${jamaah.id}`}>
                                                        <Button variant="ghost" size="sm" className="!p-2 text-amber-400 hover:bg-amber-500/10">
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" className="!p-2 text-rose-400 hover:bg-rose-500/10" onClick={() => handleDelete(jamaah)}>
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
                )}

                {/* Footer / Pagination */}
                <div className="px-6 py-4 border-t border-surface-border bg-dark-tertiary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-medium text-white">{filteredJamaahList.length}</span> of <span className="font-medium text-white">{pagination.total}</span> entries
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="!px-3"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-1 px-2">
                            <span className="text-sm font-medium text-white">{currentPage}</span>
                            <span className="text-sm text-gray-500">/</span>
                            <span className="text-sm text-gray-500">{pagination.totalPages || 1}</span>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={currentPage >= (pagination.totalPages || 1)}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="!px-3"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* View Jamaah Modal */}
            <ViewJamaahModal
                isOpen={showViewModal}
                onClose={() => { setShowViewModal(false); setSelectedJamaah(null); }}
                data={selectedJamaah}
            />
        </div>
    );
};

export default JamaahList;

