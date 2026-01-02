import React from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../../components/molecules/MetricCard';
import Card from '../../components/molecules/Card';
import { Wallet, Users, Package, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useDashboardOverview, useRecentTransactions } from '../../hooks/useDashboard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDateToID } from '../../utils/dateUtils';
import Button from '../../components/atoms/Button'; // Assuming Button component is available
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/atoms/Table';

const Dashboard = () => {
    const navigate = useNavigate();
    // Fetch data from API using TanStack Query
    const { data: overviewData, isLoading: overviewLoading, isError: overviewError, error: overviewErrorObj, refetch } = useDashboardOverview();
    const { data: transactionsData, isLoading: transactionsLoading } = useRecentTransactions(10);

    // Extract metrics from API response with fallbacks
    // API returns: { metrics: {...}, cashflow: [...], manifestStatus: [...], recentTransactions: [...], paymentStatus: [...] }
    const overview = overviewData?.data || {};
    const metricsData = overview.metrics || {};

    // Calculate jamaahBelumLunas from paymentStatus array (sum all non-lunas statuses)
    const paymentStatusArray = Array.isArray(overview.paymentStatus) ? overview.paymentStatus : [];
    const jamaahBelumLunas = paymentStatusArray
        .filter(item => item.status !== 'lunas')
        .reduce((sum, item) => sum + (item.count || 0), 0);

    const metrics = {
        totalKas: metricsData.totalKas || 0,
        piutang: metricsData.piutangJamaah || 0,
        jamaahAktif: metricsData.jamaahAktif || 0,
        paketAktif: metricsData.paketAktif || 0,
        jamaahBelumLunas,
        paketOpen: overview.manifestStatus?.length || 0,
        paketClose: 0, // Could add this to API if needed
        kasTrend: null, // Could calculate from cashflow data
        piutangTrend: null,
    };

    const recentTransactions = overview.recentTransactions || transactionsData?.data || [];

    // Chart Data Preparation
    const cashflowData = (overview.cashflow || []).map(item => ({
        name: item.month,
        masuk: item.totalIncome / 1000000,
        keluar: item.totalExpense / 1000000
    }));

    const manifestData = (overview.manifestStatus || []).map(item => ({
        name: item.status,
        value: item.count
    }));

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e'];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-dark-secondary border border-surface-border rounded-xl p-3 shadow-xl">
                    <p className="text-white font-medium mb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: Rp {entry.value.toFixed(1)}M
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };
    // Loading state
    if (overviewLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-3" />
                    <p className="text-gray-400">Memuat data dashboard...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (overviewError) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="!p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Gagal Memuat Data</h3>
                    <p className="text-gray-400 mb-6">{overviewErrorObj?.message || 'Terjadi kesalahan saat memuat data dashboard'}</p>
                    <Button onClick={() => refetch()} icon={<RefreshCw className="w-4 h-4" />}>
                        Coba Lagi
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">Selamat datang di ARG Tour & Travel Dashboard</p>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <MetricCard
                    title="Total Kas"
                    value={metrics.totalKas}
                    currency={true}
                    subtitle="Rp"
                    trend={metrics.kasTrend?.direction || null}
                    trendValue={metrics.kasTrend?.label || null}
                    icon={<Wallet className="w-6 h-6" />}
                    iconBgColor="bg-emerald-500/20"
                    iconColor="text-emerald-400"
                />

                <MetricCard
                    title="Piutang Jamaah"
                    value={metrics.piutang}
                    currency={true}
                    subtitle={`${metrics.jamaahBelumLunas} jamaah belum lunas`}
                    trend={metrics.piutangTrend?.direction || null}
                    trendValue={metrics.piutangTrend?.label || null}
                    icon={<TrendingUp className="w-6 h-6" />}
                    iconBgColor="bg-amber-500/20"
                    iconColor="text-amber-400"
                />

                <MetricCard
                    title="Jamaah Aktif"
                    value={metrics.jamaahAktif}
                    subtitle={`Total jamaah terdaftar`}
                    icon={<Users className="w-6 h-6" />}
                    iconBgColor="bg-blue-500/20"
                    iconColor="text-blue-400"
                />

                <MetricCard
                    title="Paket Aktif"
                    value={`${metrics.paketAktif} Paket`}
                    subtitle={`Open: ${metrics.paketOpen}, Close: ${metrics.paketClose}`}
                    icon={<Package className="w-6 h-6" />}
                    iconBgColor="bg-purple-500/20"
                    iconColor="text-purple-400"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card title="Grafik Cashflow" subtitle="6 bulan terakhir (Juta Rp)">
                    <div className="h-64 mt-4">
                        {cashflowData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={cashflowData}>
                                    <defs>
                                        <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}M`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="masuk" name="Masuk" stroke="#10b981" fillOpacity={1} fill="url(#colorMasuk)" />
                                    <Area type="monotone" dataKey="keluar" name="Keluar" stroke="#f43f5e" fillOpacity={1} fill="url(#colorKeluar)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center bg-dark-tertiary/20 rounded-xl border border-dashed border-surface-border">
                                <TrendingUp className="w-8 h-8 text-gray-600 mb-2" />
                                <p className="text-gray-500 text-sm">Belum ada data cashflow</p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card title="Status Manifest" subtitle="Distribusi jamaah per status">
                    <div className="h-64 mt-4">
                        {manifestData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={manifestData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {manifestData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center bg-dark-tertiary/20 rounded-xl border border-dashed border-surface-border">
                                <Package className="w-8 h-8 text-gray-600 mb-2" />
                                <p className="text-gray-500 text-sm">Belum ada data manifest</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card
                title="Transaksi Terbaru"
                subtitle="10 transaksi terakhir"
                headerAction={
                    <button
                        onClick={() => navigate('/keuangan/cashflow')}
                        className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
                    >
                        Lihat Semua
                    </button>
                }
            >
                {transactionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
                    </div>
                ) : recentTransactions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Belum ada transaksi</p>
                    </div>
                ) : (
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Tanggal</Th>
                                <Th>Tipe</Th>
                                <Th>Dari/Ke</Th>
                                <Th>Paket</Th>
                                <Th>Kategori</Th>
                                <Th align="right">Jumlah</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {recentTransactions.map((transaction) => (
                                <Tr key={transaction.id}>
                                    <Td className="whitespace-nowrap">
                                        {transaction.transactionDate ? formatDateToID(transaction.transactionDate) : '-'}
                                    </Td>
                                    <Td className="whitespace-nowrap">
                                        <span className={`
                                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border
                                            ${transaction.type === 'pemasukan'
                                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                            }
                                        `}>
                                            {transaction.type === 'pemasukan' ? (
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            ) : (
                                                <ArrowDownRight className="w-3.5 h-3.5" />
                                            )}
                                            {transaction.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                                        </span>
                                    </Td>
                                    <Td className="whitespace-nowrap font-medium text-gray-200">
                                        {transaction.jamaah?.name || transaction.vendor?.name || '-'}
                                    </Td>
                                    <Td className="whitespace-nowrap">
                                        <span className="px-2 py-0.5 text-xs font-medium bg-surface-glass rounded text-gray-400">
                                            {transaction.package?.code || '-'}
                                        </span>
                                    </Td>
                                    <Td className="whitespace-nowrap text-gray-400">
                                        {transaction.incomeCategory || transaction.expenseCategory || '-'}
                                    </Td>
                                    <Td align="right" className="whitespace-nowrap font-tabular font-semibold">
                                        <div className={`flex items-center justify-end gap-1 ${transaction.type === 'pemasukan' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            <span>{transaction.type === 'pemasukan' ? '+' : '-'}</span>
                                            <span>Rp {formatCurrency(Math.abs(parseFloat(transaction.amount) || 0), false)}</span>
                                        </div>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Card>
        </div>
    );
};

export default Dashboard;
