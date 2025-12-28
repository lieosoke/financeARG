import React, { useState } from 'react';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import Card from '../../components/molecules/Card';
import MetricCard from '../../components/molecules/MetricCard';
import Button from '../../components/atoms/Button';
import { formatCurrency } from '../../utils/formatters';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTransactionsCashflow, useTransactionsTotals } from '../../hooks/useTransactions';
import { useRecentTransactions } from '../../hooks/useDashboard';

const CashflowPage = () => {
    const [period, setPeriod] = useState('6months');

    // Map period to months number
    const monthsMap = {
        '3months': 3,
        '6months': 6,
        '12months': 12,
    };
    const months = monthsMap[period] || 6;

    // Fetch data from API
    const { data: cashflowData, isLoading: cashflowLoading } = useTransactionsCashflow(months);
    const { data: totalsData, isLoading: totalsLoading } = useTransactionsTotals();
    const { data: recentData, isLoading: recentLoading } = useRecentTransactions(5);

    // Extract data with fallbacks
    const chartData = cashflowData?.data || [];
    const totals = totalsData?.data || { totalIncome: 0, totalExpense: 0 };
    const recentTransactions = recentData?.data || [];

    // Calculate metrics
    const totalPemasukan = parseFloat(totals.totalIncome) || 0;
    const totalPengeluaran = parseFloat(totals.totalExpense) || 0;
    const saldo = totalPemasukan - totalPengeluaran;
    const growthRate = totalPemasukan > 0 ? ((saldo / totalPemasukan) * 100).toFixed(1) : 0;

    const isLoading = cashflowLoading || totalsLoading;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-dark-secondary border border-surface-border rounded-xl p-3 shadow-xl">
                    <p className="text-white font-medium mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Transform API data for charts
    const transformedChartData = chartData.map(item => ({
        month: item.month || item.label,
        pemasukan: parseFloat(item.income) || parseFloat(item.pemasukan) || 0,
        pengeluaran: parseFloat(item.expense) || parseFloat(item.pengeluaran) || 0,
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Arus Kas</h1>
                    <p className="text-sm text-gray-500 mt-1">Ringkasan cashflow dan transaksi</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={period === '3months' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setPeriod('3months')}
                    >
                        3 Bulan
                    </Button>
                    <Button
                        variant={period === '6months' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setPeriod('6months')}
                    >
                        6 Bulan
                    </Button>
                    <Button
                        variant={period === '12months' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setPeriod('12months')}
                    >
                        1 Tahun
                    </Button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <MetricCard
                    title="Total Pemasukan"
                    value={isLoading ? 0 : totalPemasukan}
                    currency={true}
                    trend="up"
                    trendValue={isLoading ? 'Memuat...' : 'Periode ini'}
                    icon={isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowUpRight className="w-6 h-6" />}
                    iconBgColor="bg-emerald-500/20"
                    iconColor="text-emerald-400"
                />
                <MetricCard
                    title="Total Pengeluaran"
                    value={isLoading ? 0 : totalPengeluaran}
                    currency={true}
                    trend="up"
                    trendValue={isLoading ? 'Memuat...' : 'Periode ini'}
                    icon={isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowDownRight className="w-6 h-6" />}
                    iconBgColor="bg-rose-500/20"
                    iconColor="text-rose-400"
                />
                <MetricCard
                    title="Saldo Bersih"
                    value={isLoading ? 0 : saldo}
                    currency={true}
                    trend={saldo >= 0 ? 'up' : 'down'}
                    trendValue={saldo >= 0 ? 'Surplus' : 'Defisit'}
                    icon={isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wallet className="w-6 h-6" />}
                    iconBgColor="bg-primary-500/20"
                    iconColor="text-primary-400"
                />
                <MetricCard
                    title="Margin"
                    value={isLoading ? '...' : `${growthRate}%`}
                    trend={parseFloat(growthRate) >= 0 ? 'up' : 'down'}
                    trendValue={parseFloat(growthRate) >= 20 ? 'Bagus' : 'Perlu ditingkatkan'}
                    icon={isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <TrendingUp className="w-6 h-6" />}
                    iconBgColor="bg-blue-500/20"
                    iconColor="text-blue-400"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Area Chart */}
                <Card title="Grafik Cashflow" subtitle="Pemasukan vs Pengeluaran">
                    <div className="h-72">
                        {cashflowLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                            </div>
                        ) : transformedChartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-500">Belum ada data cashflow</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={transformedChartData}>
                                    <defs>
                                        <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `${value / 1000000}M`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="pemasukan"
                                        name="Pemasukan"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorPemasukan)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="pengeluaran"
                                        name="Pengeluaran"
                                        stroke="#f43f5e"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorPengeluaran)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* Bar Chart */}
                <Card title="Perbandingan Bulanan" subtitle="Profit per bulan">
                    <div className="h-72">
                        {cashflowLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                            </div>
                        ) : transformedChartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-500">Belum ada data</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={transformedChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `${value / 1000000}M`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="pemasukan" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card
                title="Transaksi Terbaru"
                subtitle="5 transaksi terakhir"
                headerAction={
                    <Button variant="ghost" size="sm">Lihat Semua</Button>
                }
            >
                {recentLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
                    </div>
                ) : recentTransactions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Belum ada transaksi</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentTransactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-dark-tertiary/50 hover:bg-surface-glass transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'pemasukan' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                                        }`}>
                                        {tx.type === 'pemasukan' ? (
                                            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                                        ) : (
                                            <ArrowDownRight className="w-5 h-5 text-rose-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {tx.description || tx.jamaahName || tx.vendorName || 'Transaksi'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString('id-ID') : '-'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`font-tabular font-semibold ${tx.type === 'pemasukan' ? 'text-emerald-400' : 'text-rose-400'
                                    }`}>
                                    {tx.type === 'pemasukan' ? '+' : '-'}{formatCurrency(parseFloat(tx.amount) || 0)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default CashflowPage;
