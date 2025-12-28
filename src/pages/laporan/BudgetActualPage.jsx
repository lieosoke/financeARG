import React, { useState } from 'react';
import { Target, TrendingUp, TrendingDown, AlertCircle, ChevronDown, Loader2, Package, Download, RefreshCw } from 'lucide-react';
import Card from '../../components/molecules/Card';
import Badge from '../../components/atoms/Badge';
import { formatCurrency } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useBudgetActual } from '../../hooks/useReports';
import Button from '../../components/atoms/Button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';

const BudgetActualPage = () => {
    const [selectedPaket, setSelectedPaket] = useState('all');

    // Fetch data from API
    const { data: reportData, isLoading, isError, error, refetch } = useBudgetActual();

    // Extract data with fallbacks
    const budgetData = reportData?.data || [];
    const summary = reportData?.summary || { totalEstimated: 0, totalActual: 0, totalVariance: 0 };

    // Build package options from data
    const packageOptions = [
        { id: 'all', nama: 'Semua Paket' },
        ...budgetData.map(pkg => ({
            id: pkg.packageId,
            nama: pkg.packageName,
            kode: pkg.packageCode,
        })),
    ];

    // Filter data based on selection
    const filteredData = selectedPaket === 'all'
        ? budgetData
        : budgetData.filter(p => p.packageId === selectedPaket);

    // Prepare chart data - per package
    const chartData = filteredData.map(item => ({
        name: item.packageCode,
        Budget: item.estimatedCost / 1000000,
        Aktual: item.actualCost / 1000000,
    }));

    // Calculate totals from filtered data
    const totals = {
        budget: filteredData.reduce((sum, p) => sum + p.estimatedCost, 0),
        actual: filteredData.reduce((sum, p) => sum + p.actualCost, 0),
        variance: filteredData.reduce((sum, p) => sum + p.variance, 0),
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-dark-secondary border border-surface-border rounded-xl p-3 shadow-xl">
                    <p className="text-white font-medium mb-2">{label}</p>
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

    const handleExportPDF = async () => {
        const element = document.getElementById('report-content');
        if (!element) return;

        toast.loading('Menyiapkan PDF...');
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#0f172a'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Budget-vs-Actual-${new Date().toISOString().split('T')[0]}.pdf`);
            toast.dismiss();
            toast.success('PDF berhasil diunduh');
        } catch (error) {
            console.error('PDF Export error:', error);
            toast.dismiss();
            toast.error('Gagal membuat PDF');
        }
    };

    // Error state
    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="!p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Gagal Memuat Data</h3>
                    <p className="text-gray-400 mb-6">{error?.message || 'Terjadi kesalahan saat memuat laporan budget vs actual.'}</p>
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
            <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Budget vs Actual</h1>
                    <p className="text-sm text-gray-500 mt-1">Perbandingan anggaran dengan realisasi</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={<Download className="w-4 h-4" />}
                        onClick={handleExportPDF}
                        disabled={isLoading}
                    >
                        Export PDF
                    </Button>
                    <div className="relative">
                        <select
                            className="px-4 py-2.5 pr-10 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 appearance-none"
                            value={selectedPaket}
                            onChange={(e) => setSelectedPaket(e.target.value)}
                            disabled={isLoading}
                        >
                            {packageOptions.map((pkg) => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.kode ? `${pkg.kode} - ${pkg.nama}` : pkg.nama}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div id="report-content" className="space-y-6">

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="!p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                                ) : (
                                    <Target className="w-5 h-5 text-blue-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Budget</p>
                                <p className="text-lg font-bold text-blue-400">
                                    {isLoading ? '...' : formatCurrency(totals.budget)}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="!p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                                ) : (
                                    <TrendingUp className="w-5 h-5 text-purple-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Aktual</p>
                                <p className="text-lg font-bold text-purple-400">
                                    {isLoading ? '...' : formatCurrency(totals.actual)}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="!p-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totals.variance >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                ) : totals.variance >= 0 ? (
                                    <TrendingDown className="w-5 h-5 text-emerald-400" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-rose-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Variance</p>
                                <p className={`text-lg font-bold ${totals.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {isLoading ? '...' : `${totals.variance >= 0 ? '+' : ''}${formatCurrency(totals.variance)}`}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Chart */}
                <Card title="Grafik Budget vs Aktual" subtitle="Perbandingan per paket">
                    <div className="h-72">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                            </div>
                        ) : chartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-500">Belum ada data</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `${value}M`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ color: '#9ca3af' }} />
                                    <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Aktual" fill="#a855f7" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* Detailed Table */}
                <Card title="Detail per Paket" subtitle="Variance analysis">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Tidak ada data</h3>
                            <p className="text-gray-500">Belum ada data budget vs actual</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-6 px-6">
                            <table className="table-dark w-full">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Paket
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Budget
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Aktual
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Variance
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-border">
                                    {filteredData.map((item) => (
                                        <tr key={item.packageId} className="hover:bg-surface-glass transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-surface-glass rounded-lg flex items-center justify-center">
                                                        <Package className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{item.packageName}</p>
                                                        <p className="text-xs text-gray-500">{item.packageCode}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="font-tabular text-blue-400">{formatCurrency(item.estimatedCost)}</span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="font-tabular text-purple-400">{formatCurrency(item.actualCost)}</span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className={`font-tabular font-semibold ${item.isUnderBudget ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {item.isUnderBudget ? '+' : ''}{formatCurrency(item.variance)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <Badge variant={item.isUnderBudget ? 'success' : 'danger'}>
                                                    {item.isUnderBudget ? 'Under' : 'Over'} ({Math.abs(item.variancePercent).toFixed(1)}%)
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t-2 border-surface-border">
                                    <tr className="bg-dark-tertiary/50">
                                        <td className="px-4 py-4 font-semibold text-white">Total</td>
                                        <td className="px-4 py-4 text-right font-tabular font-semibold text-blue-400">
                                            {formatCurrency(totals.budget)}
                                        </td>
                                        <td className="px-4 py-4 text-right font-tabular font-semibold text-purple-400">
                                            {formatCurrency(totals.actual)}
                                        </td>
                                        <td className="px-4 py-4 text-right font-tabular font-bold">
                                            <span className={totals.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                                {totals.variance >= 0 ? '+' : ''}{formatCurrency(totals.variance)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <Badge variant={totals.variance >= 0 ? 'success' : 'danger'}>
                                                {totals.variance >= 0 ? 'Under Budget' : 'Over Budget'}
                                            </Badge>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default BudgetActualPage;
