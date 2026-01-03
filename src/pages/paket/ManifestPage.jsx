import React, { useState, useRef } from 'react';
import { FileText, Download, Printer, Users, Plane, Calendar, ChevronDown, Loader2 } from 'lucide-react';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Badge from '../../components/atoms/Badge';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/atoms/Table';
import { usePackages } from '../../hooks/usePackages';
import { useJamaahList } from '../../hooks/useJamaah';

const ManifestPage = () => {
    const [selectedPaket, setSelectedPaket] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showPrintView, setShowPrintView] = useState(false);
    const printRef = useRef(null);

    // Fetch packages
    const { data: packagesData, isLoading: packagesLoading } = usePackages({
        limit: 100,
        status: 'open'
    });
    const packages = packagesData?.data || [];

    // Fetch jamaah for selected package
    const queryParams = {
        packageId: selectedPaket,
        limit: 1000, // Get all jamaah for the manifest
        ...(filterStatus !== 'all' && { paymentStatus: filterStatus }),
    };

    const { data: jamaahData, isLoading: jamaahLoading } = useJamaahList(queryParams, {
        enabled: !!selectedPaket
    });

    const manifestData = jamaahData?.data || [];

    const getStatusBadge = (status) => {
        const statusConfig = {
            lunas: { variant: 'success', label: 'Lunas' },
            pending: { variant: 'warning', label: 'Belum Lunas' },
            dp: { variant: 'info', label: 'DP' },
            cicilan: { variant: 'secondary', label: 'Cicilan' },
            dibatalkan: { variant: 'danger', label: 'Dibatalkan' },
        };
        const config = statusConfig[status] || { variant: 'neutral', label: status || '-' };
        return <Badge variant={config.variant} size="sm" dot>{config.label}</Badge>;
    };

    const selectedPackageData = packages.find(p => p.id.toString() === selectedPaket);

    const handlePrint = () => {
        if (!selectedPackageData) return;
        setShowPrintView(true);
        setTimeout(() => {
            window.print();
            setShowPrintView(false);
        }, 500);
    };

    const handleDownloadPDF = () => {
        if (!selectedPackageData) return;
        setShowPrintView(true);
        setTimeout(() => {
            window.print();
            setShowPrintView(false);
        }, 500);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-area, .print-area * {
                        visibility: visible;
                    }
                    .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                        color: black !important;
                        padding: 20px;
                    }
                    @page {
                        size: A4;
                        margin: 20mm;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Print View */}
            {showPrintView && selectedPackageData && (
                <div className="print-area" ref={printRef}>
                    <div className="mb-6 text-center border-b pb-4 border-gray-300">
                        <h1 className="text-2xl font-bold mb-2">MANIFEST KEBERANGKATAN</h1>
                        <h2 className="text-xl font-semibold">{selectedPackageData.name}</h2>
                        <div className="flex justify-center gap-6 mt-2 text-sm text-gray-600">
                            <p>Kode: {selectedPackageData.code}</p>
                            <p>Tanggal: {selectedPackageData.departureDate ? new Date(selectedPackageData.departureDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
                            <p>Status: {filterStatus === 'all' ? 'Semua' : filterStatus === 'lunas' ? 'Lunas' : 'Belum Lunas'}</p>
                        </div>
                    </div>

                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-300">
                                <th className="p-3 font-bold border-b border-gray-300">No</th>
                                <th className="p-3 font-bold border-b border-gray-300">Nama Jamaah</th>
                                <th className="p-3 font-bold border-b border-gray-300">NIK</th>
                                <th className="p-3 font-bold border-b border-gray-300">Telepon</th>
                                <th className="p-3 font-bold border-b border-gray-300">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {manifestData.length > 0 ? (
                                manifestData.map((jamaah, index) => (
                                    <tr key={jamaah.id} className="border-b border-gray-200">
                                        <td className="p-3">{index + 1}</td>
                                        <td className="p-3 font-medium">{jamaah.name}</td>
                                        <td className="p-3">{jamaah.nik || '-'}</td>
                                        <td className="p-3">{jamaah.phone || '-'}</td>
                                        <td className="p-3">
                                            {jamaah.paymentStatus === 'lunas' ? 'LUNAS' :
                                                jamaah.paymentStatus === 'pending' ? 'BELUM LUNAS' :
                                                    jamaah.paymentStatus ? jamaah.paymentStatus.toUpperCase() : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-3 text-center text-gray-500">
                                        Tidak ada data jamaah
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="mt-8 text-right text-xs text-gray-500">
                        Dicetak pada: {new Date().toLocaleString('id-ID')}
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className={`page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${showPrintView ? 'no-print' : ''}`}>
                <div>
                    <h1 className="page-title">Manifest Keberangkatan</h1>
                    <p className="text-sm text-gray-500 mt-1">Daftar jamaah per keberangkatan</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        icon={<Printer className="w-4 h-4" />}
                        onClick={handlePrint}
                        disabled={!selectedPaket}
                    >
                        Print
                    </Button>
                    <Button
                        icon={<Download className="w-4 h-4" />}
                        onClick={handleDownloadPDF}
                        disabled={!selectedPaket}
                    >
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Package Selector */}
            <Card className={showPrintView ? 'no-print' : ''}>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pilih Paket Keberangkatan
                        </label>
                        <div className="relative">
                            <Plane className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                            {packagesLoading ? (
                                <div className="w-full px-4 py-3 pl-11 rounded-xl bg-gray-50 dark:bg-dark-tertiary/50 border border-gray-200 dark:border-surface-border flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                    <span className="text-gray-500">Memuat paket...</span>
                                </div>
                            ) : (
                                <select
                                    className="w-full px-4 py-3 pl-11 rounded-xl bg-gray-50 dark:bg-dark-tertiary/50 border border-gray-200 dark:border-surface-border text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 appearance-none"
                                    value={selectedPaket}
                                    onChange={(e) => setSelectedPaket(e.target.value)}
                                >
                                    <option value="">-- Pilih Paket --</option>
                                    {packages.map((pkg) => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.code} - {pkg.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                    {selectedPackageData && (
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    {selectedPackageData.departureDate
                                        ? new Date(selectedPackageData.departureDate).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })
                                        : '-'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Users className="w-4 h-4" />
                                <span>{manifestData.length} Jamaah</span>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Filter Buttons */}
            {selectedPaket && (
                <div className={`flex gap-2 ${showPrintView ? 'no-print' : ''}`}>
                    <Button
                        size="sm"
                        variant={filterStatus === 'all' ? 'primary' : 'secondary'}
                        onClick={() => setFilterStatus('all')}
                    >
                        Semua
                    </Button>
                    <Button
                        size="sm"
                        variant={filterStatus === 'lunas' ? 'primary' : 'secondary'}
                        onClick={() => setFilterStatus('lunas')}
                    >
                        Lunas
                    </Button>
                    <Button
                        size="sm"
                        variant={filterStatus === 'pending' ? 'primary' : 'secondary'}
                        onClick={() => setFilterStatus('pending')}
                    >
                        Belum Lunas
                    </Button>
                </div>
            )}

            {/* Manifest Table */}
            {selectedPaket ? (
                <Card
                    title={`Manifest: ${selectedPackageData?.name || '-'}`}
                    subtitle={`Total ${manifestData.length} jamaah`}
                    className={showPrintView ? 'no-print' : ''}
                >
                    {jamaahLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-3" />
                                <p className="text-gray-400">Memuat data manifest...</p>
                            </div>
                        </div>
                    ) : manifestData.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tidak ada jamaah</h3>
                            <p className="text-gray-500">
                                {filterStatus === 'all'
                                    ? 'Belum ada jamaah terdaftar di paket ini'
                                    : `Tidak ada jamaah dengan status ${filterStatus}`}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-6 px-6">
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th>No</Th>
                                        <Th>Nama Jamaah</Th>
                                        <Th>NIK</Th>
                                        <Th>Telepon</Th>
                                        <Th>Status Pembayaran</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {manifestData.map((jamaah, index) => (
                                        <Tr key={jamaah.id}>
                                            <Td className="text-gray-600 dark:text-gray-400">
                                                {index + 1}
                                            </Td>
                                            <Td className="font-medium text-gray-900 dark:text-white">
                                                {jamaah.name}
                                            </Td>
                                            <Td className="text-gray-600 dark:text-gray-400 font-mono">
                                                {jamaah.nik || '-'}
                                            </Td>
                                            <Td className="text-gray-600 dark:text-gray-400">
                                                {jamaah.phone || '-'}
                                            </Td>
                                            <Td>
                                                {getStatusBadge(jamaah.paymentStatus)}
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </div>
                    )}
                </Card>
            ) : (
                <Card className={showPrintView ? 'no-print' : ''}>
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-surface-glass rounded-2xl flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum Ada Paket Dipilih</h3>
                        <p className="text-gray-500">Pilih paket keberangkatan untuk melihat manifest</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ManifestPage;
