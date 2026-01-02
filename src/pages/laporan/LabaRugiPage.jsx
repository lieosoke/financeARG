import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Package, ChevronDown, Loader2, Download, RefreshCw, AlertCircle } from 'lucide-react';
import Card from '../../components/molecules/Card';
import Badge from '../../components/atoms/Badge';
import { formatCurrency } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useProfitLoss } from '../../hooks/useReports';
import Button from '../../components/atoms/Button';
import { Table, Thead, Tbody, Tr, Th, Td, Tfoot } from '../../components/atoms/Table';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const LabaRugiPage = () => {
    const [selectedPaket, setSelectedPaket] = useState('all');

    // Fetch data from API
    const { data: reportData, isLoading, isError, error, refetch } = useProfitLoss();

    // Extract data with fallbacks
    const profitLossData = reportData?.data || [];
    const summary = reportData?.summary || { totalIncome: 0, totalExpense: 0, totalProfit: 0 };

    // Build package options from data
    const packageOptions = [
        { id: 'all', nama: 'Semua Paket' },
        ...profitLossData.map(pkg => ({
            id: pkg.packageId,
            nama: pkg.packageName,
            kode: pkg.packageCode,
        })),
    ];

    // Filter data based on selection
    const filteredData = selectedPaket === 'all'
        ? profitLossData
        : profitLossData.filter(p => p.packageId === selectedPaket);

    // Prepare chart data
    const chartData = filteredData.map(item => ({
        name: item.packageCode,
        pendapatan: item.totalIncome / 1000000,
        pengeluaran: item.totalExpense / 1000000,
        labaRugi: item.profit / 1000000,
    }));

    // Calculate totals from filtered data
    const totals = {
        pendapatan: filteredData.reduce((sum, p) => sum + p.totalIncome, 0),
        pengeluaran: filteredData.reduce((sum, p) => sum + p.totalExpense, 0),
        labaRugi: filteredData.reduce((sum, p) => sum + p.profit, 0),
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

    const handleExportPDF = () => {
        const input = document.getElementById('report-content');
        if (input) {
            html2canvas(input, {
                scale: 2, // Increase scale for better resolution
                useCORS: true, // Enable cross-origin images
                logging: true,
            }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210; // A4 width in mm
                const pageHeight = 297; // A4 height in mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                pdf.save('laba-rugi-per-paket.pdf');
            });
        }
    };

    // Error state
    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="!p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Gagal Memuat Data</h3>
                    <p className="text-gray-400 mb-6">{error?.message || 'Terjadi kesalahan saat memuat laporan laba/rugi.'}</p>
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
                    <h1 className="page-title">Laba/Rugi per Paket</h1>
                    <p className="text-sm text-gray-500 mt-1">Analisis profitabilitas setiap paket</p>
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
                                    {pkg.kode ? `${pkg.kode} - ${pkg.nama} ` : pkg.nama}
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
                    <Card className="!p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                                ) : (
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Pendapatan</p>
                                <p className="text-lg font-bold text-emerald-400">
                                    {isLoading ? '...' : formatCurrency(totals.pendapatan)}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="!p-4 bg-gradient-to-r from-rose-500/10 to-rose-600/5 border-rose-500/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center">
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
                                ) : (
                                    <TrendingDown className="w-5 h-5 text-rose-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Pengeluaran</p>
                                <p className="text-lg font-bold text-rose-400">
                                    {isLoading ? '...' : formatCurrency(totals.pengeluaran)}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="!p-4 bg-gradient-to-r from-primary-500/10 to-primary-600/5 border-primary-500/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
                                ) : (
                                    <span className="text-lg font-bold text-primary-400">Rp</span>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Laba Bersih</p>
                                <p className="text-lg font-bold text-primary-400">
                                    {isLoading ? '...' : formatCurrency(totals.labaRugi)}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Chart */}
                <Card title="Grafik Perbandingan" subtitle="Pendapatan vs Pengeluaran per Paket">
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
                                <BarChart data={chartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `${value} M`} />
                                    <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={100} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="pendapatan" name="Pendapatan" fill="#10b981" radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* Detailed Table */}
                <Card title="Detail Laba/Rugi" subtitle="Per paket keberangkatan">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Tidak ada data</h3>
                            <p className="text-gray-500">Belum ada data laba/rugi</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-6 px-6">
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th>Paket</Th>
                                        <Th align="right">Pendapatan</Th>
                                        <Th align="right">Pengeluaran</Th>
                                        <Th align="right">Laba/Rugi</Th>
                                        <Th align="center">Margin</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredData.map((item) => (
                                        <Tr key={item.packageId}>
                                            <Td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-surface-glass rounded-lg flex items-center justify-center">
                                                        <Package className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{item.packageName}</p>
                                                        <p className="text-xs text-gray-500">{item.packageCode}</p>
                                                    </div>
                                                </div>
                                            </Td>
                                            <Td align="right">
                                                <span className="font-tabular text-emerald-400">{formatCurrency(item.totalIncome)}</span>
                                            </Td>
                                            <Td align="right">
                                                <span className="font-tabular text-rose-400">{formatCurrency(item.totalExpense)}</span>
                                            </Td>
                                            <Td align="right">
                                                <span className={`font-tabular font-semibold ${item.isProfit ? 'text-primary-400' : 'text-rose-400'} `}>
                                                    {formatCurrency(item.profit)}
                                                </span>
                                            </Td>
                                            <Td align="center">
                                                <Badge variant={item.margin >= 20 ? 'success' : item.margin >= 10 ? 'warning' : 'danger'}>
                                                    {item.margin}%
                                                </Badge>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                                <Tfoot>
                                    <Tr className="bg-dark-tertiary/50">
                                        <Td className="font-semibold text-white">Total</Td>
                                        <Td align="right" className="font-tabular font-semibold text-emerald-400">
                                            {formatCurrency(totals.pendapatan)}
                                        </Td>
                                        <Td align="right" className="font-tabular font-semibold text-rose-400">
                                            {formatCurrency(totals.pengeluaran)}
                                        </Td>
                                        <Td align="right" className="font-tabular font-bold text-primary-400">
                                            {formatCurrency(totals.labaRugi)}
                                        </Td>
                                        <Td align="center">
                                            <Badge variant="primary">
                                                {totals.pendapatan > 0 ? ((totals.labaRugi / totals.pendapatan) * 100).toFixed(1) : 0}%
                                            </Badge>
                                        </Td>
                                    </Tr>
                                </Tfoot>
                            </Table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default LabaRugiPage;
