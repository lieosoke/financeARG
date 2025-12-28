import React, { useState } from 'react';
import { Search, Clock, User, Activity, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Badge from '../../components/atoms/Badge';
import { useAuditLogs } from '../../hooks/useReports';

const AuditLogPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 20;

    // Build query params
    const queryParams = {
        page: currentPage,
        limit,
        ...(filterAction !== 'all' && { action: filterAction }),
    };

    // Fetch data from API
    const { data: logsData, isLoading, error } = useAuditLogs(queryParams);

    // Extract data with fallbacks
    const auditLogs = logsData?.data || [];
    const pagination = logsData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };

    // Filter locally for search
    const filteredData = auditLogs.filter(log => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return (
            (log.userName || '').toLowerCase().includes(searchLower) ||
            (log.entityName || log.entityId || '').toLowerCase().includes(searchLower) ||
            (log.details || '').toLowerCase().includes(searchLower) ||
            (log.entity || '').toLowerCase().includes(searchLower)
        );
    });

    const actions = [
        { value: 'all', label: 'Semua' },
        { value: 'create', label: 'Create' },
        { value: 'update', label: 'Update' },
        { value: 'delete', label: 'Delete' },
        { value: 'login', label: 'Login' },
    ];

    const getActionBadge = (action) => {
        const config = {
            create: { variant: 'success', label: 'Create' },
            update: { variant: 'warning', label: 'Update' },
            delete: { variant: 'danger', label: 'Delete' },
            login: { variant: 'info', label: 'Login' },
        };
        const a = config[action] || { variant: 'neutral', label: action };
        return <Badge variant={a.variant}>{a.label}</Badge>;
    };

    const getEntityIcon = (entity) => {
        switch (entity?.toLowerCase()) {
            case 'jamaah':
                return <User className="w-4 h-4" />;
            case 'transaction':
            case 'transaksi':
                return <Activity className="w-4 h-4" />;
            default:
                return <Activity className="w-4 h-4" />;
        }
    };

    const handleFilterChange = (value) => {
        setFilterAction(value);
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
                        <p className="text-gray-400 text-sm">{error.message || 'Terjadi kesalahan saat memuat audit log'}</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Audit Log</h1>
                <p className="text-sm text-gray-500 mt-1">Riwayat aktivitas sistem (Owner Only)</p>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari user, entity, atau detail..."
                            icon={<Search className="w-4 h-4" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {actions.map((act) => (
                            <Button
                                key={act.value}
                                variant={filterAction === act.value ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => handleFilterChange(act.value)}
                            >
                                {act.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Audit Log List */}
            <Card>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-3" />
                            <p className="text-gray-400">Memuat audit log...</p>
                        </div>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-12">
                        <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Tidak ada data</h3>
                        <p className="text-gray-500">Belum ada riwayat aktivitas</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {filteredData.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-dark-tertiary/30 hover:bg-surface-glass transition-colors"
                                >
                                    <div className="w-10 h-10 bg-surface-glass rounded-xl flex items-center justify-center flex-shrink-0">
                                        {getEntityIcon(log.entity)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-white">{log.userName || 'System'}</span>
                                                    {getActionBadge(log.action)}
                                                    <span className="text-gray-400">{log.entity}</span>
                                                </div>
                                                <p className="text-sm text-gray-300 mt-1">{log.details || '-'}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Entity: <span className="text-gray-400">{log.entityId || '-'}</span>
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {log.createdAt
                                                        ? new Date(log.createdAt).toLocaleString('id-ID')
                                                        : '-'}
                                                </div>
                                                {log.ip && (
                                                    <p className="text-xs text-gray-600 mt-1">IP: {log.ip}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-border">
                            <p className="text-sm text-gray-500">
                                Menampilkan {filteredData.length} dari {pagination.total} log
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

export default AuditLogPage;
