import React, { useState } from 'react';
import { Search, Plus, Building2, AlertTriangle, CheckCircle, ChevronRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Badge from '../../components/atoms/Badge';
import { formatCurrency } from '../../utils/formatters';
import { useVendorDebts, useTotalOutstandingDebt } from '../../hooks/useVendors';
import { useSearchParams } from 'react-router-dom';
import { PayDebtModal, AddVendorDebtModal } from '../../components/modals';
import { formatDateToID } from '../../utils/dateUtils';
import VendorDebtDetailModal from '../../components/modals/VendorDebtDetailModal';

const HutangVendor = () => {
    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get('search') || '';

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAddDebtModal, setShowAddDebtModal] = useState(false);
    const limit = 20;

    // Build query params
    const queryParams = {
        page: currentPage,
        limit,
        ...(filterStatus !== 'all' && { status: filterStatus }),
    };

    // Fetch data from API
    const { data: debtsData, isLoading, isError, error, refetch } = useVendorDebts(queryParams);
    const { data: totalData, isLoading: totalLoading } = useTotalOutstandingDebt();

    // Extract data with fallbacks
    const debts = debtsData?.data || [];
    const pagination = debtsData?.pagination || { total: 0 };
    const totalOutstanding = totalData?.data?.totalOutstanding || 0;

    // Filter locally for search
    const filteredData = debts.filter(debt => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        const vendorName = debt.vendor?.name || '';
        const description = debt.description || '';

        return (
            vendorName.toLowerCase().includes(searchLower) ||
            description.toLowerCase().includes(searchLower)
        );
    });

    // Calculate stats from filtered data
    const totalStats = {
        totalHutang: filteredData.reduce((sum, v) => sum + (parseFloat(v.totalAmount) || 0), 0),
        dibayar: filteredData.reduce((sum, v) => sum + (parseFloat(v.paidAmount) || 0), 0),
        sisaHutang: filteredData.reduce((sum, v) => {
            const total = parseFloat(v.totalAmount) || 0;
            const paid = parseFloat(v.paidAmount) || 0;
            return sum + (total - paid);
        }, 0),
    };

    const getStatusBadge = (status) => {
        const config = {
            paid: { variant: 'success', label: 'Lunas', icon: <CheckCircle className="w-3 h-3" /> },
            partial: { variant: 'warning', label: 'Outstanding', icon: null },
            unpaid: { variant: 'neutral', label: 'Belum Bayar', icon: null },
            overdue: { variant: 'danger', label: 'Overdue', icon: <AlertTriangle className="w-3 h-3" /> },
        };
        const stat = config[status] || config.partial;
        return <Badge variant={stat.variant} icon={stat.icon}>{stat.label}</Badge>;
    };

    const handleFilterChange = (value) => {
        setFilterStatus(value);
        setCurrentPage(1);
    };

    // Error state
    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="!p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Gagal Memuat Data</h3>
                    <p className="text-gray-400 mb-6">{error?.message || 'Terjadi kesalahan saat memuat data hutang vendor.'}</p>
                    <div className="flex gap-4 justify-center">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setFilterStatus('all');
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
                    <h1 className="page-title">Hutang Vendor</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola hutang dan pembayaran ke vendor</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => setShowAddDebtModal(true)}
                    >
                        Tambah Hutang
                    </Button>
                    <Button
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => {
                            setSelectedDebt(null);
                            setShowPayModal(true);
                        }}
                    >
                        Catat Pembayaran
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                            ) : (
                                <Building2 className="w-5 h-5 text-blue-400" />
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Hutang</p>
                            <p className="text-lg font-bold text-white">
                                {isLoading ? '...' : formatCurrency(totalStats.totalHutang)}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                            ) : (
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Sudah Dibayar</p>
                            <p className="text-lg font-bold text-emerald-400">
                                {isLoading ? '...' : formatCurrency(totalStats.dibayar)}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            {totalLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                            ) : (
                                <AlertTriangle className="w-5 h-5 text-amber-400" />
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Sisa Hutang</p>
                            <p className="text-lg font-bold text-amber-400">
                                {totalLoading ? '...' : formatCurrency(parseFloat(totalOutstanding) || totalStats.sisaHutang)}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari vendor..."
                            icon={<Search className="w-4 h-4" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                            variant={filterStatus === 'partial' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleFilterChange('partial')}
                        >
                            Outstanding
                        </Button>
                        <Button
                            variant={filterStatus === 'overdue' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleFilterChange('overdue')}
                        >
                            Overdue
                        </Button>
                        <Button
                            variant={filterStatus === 'paid' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleFilterChange('paid')}
                        >
                            Lunas
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-3" />
                        <p className="text-gray-400">Memuat data hutang vendor...</p>
                    </div>
                </div>
            ) : filteredData.length === 0 ? (
                <Card className="!py-12">
                    <div className="text-center">
                        <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Tidak ada data</h3>
                        <p className="text-gray-500">Belum ada data hutang vendor</p>
                    </div>
                </Card>
            ) : (
                /* Vendor Cards */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredData.map((debt) => {
                        const totalAmount = parseFloat(debt.totalAmount) || 0;
                        const paidAmount = parseFloat(debt.paidAmount) || 0;
                        const remaining = totalAmount - paidAmount;
                        const paidPercent = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

                        return (
                            <Card key={debt.id} className="!p-0 overflow-hidden" hoverable>
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-surface-glass rounded-xl flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{debt.vendor?.name || 'Vendor'}</h3>
                                                <span className="text-xs text-gray-500">{debt.description || '-'}</span>
                                            </div>
                                        </div>
                                        {getStatusBadge(debt.status)}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Total Hutang</span>
                                            <span className="text-white font-medium">{formatCurrency(totalAmount)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Dibayar</span>
                                            <span className="text-emerald-400">{formatCurrency(paidAmount)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Sisa</span>
                                            <span className={`font-semibold ${remaining > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                {formatCurrency(remaining)}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div>
                                            <div className="h-2 bg-dark-tertiary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
                                                    style={{ width: `${paidPercent}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs pt-2">
                                            <span className="text-gray-500">
                                                Jatuh Tempo: {debt.dueDate ? formatDateToID(debt.dueDate) : '-'}
                                            </span>
                                            <span className="text-gray-400">{paidPercent}% terbayar</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-surface-border p-3 bg-dark-tertiary/30 flex gap-2">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => {
                                            setSelectedDebt(debt);
                                            setShowPayModal(true);
                                        }}
                                    >
                                        Bayar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => {
                                            setSelectedDebt(debt);
                                            setShowDetailModal(true);
                                        }}
                                    >
                                        Detail <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
            {/* Pay Debt Modal */}
            <PayDebtModal
                isOpen={showPayModal}
                onClose={() => {
                    setShowPayModal(false);
                    setSelectedDebt(null);
                }}
                debt={selectedDebt}
            />
            {/* Add Vendor Debt Modal */}
            <AddVendorDebtModal
                isOpen={showAddDebtModal}
                onClose={() => setShowAddDebtModal(false)}
            />
            {/* Detail Modal */}
            <VendorDebtDetailModal
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedDebt(null);
                }}
                debt={selectedDebt}
            />
        </div>
    );
};

export default HutangVendor;
