import React, { useState, useEffect } from 'react';
import { Plane, Users, ChevronDown, RefreshCw, Loader } from 'lucide-react';
import Card from '../../components/molecules/Card';
import Badge from '../../components/atoms/Badge';
import packageService from '../../services/api/packages';
import jamaahService from '../../services/api/jamaah';

const SeatControl = () => {
    const [selectedPaket, setSelectedPaket] = useState('');
    const [packagesList, setPackagesList] = useState([]);
    const [jamaahList, setJamaahList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingJamaah, setLoadingJamaah] = useState(false);
    const [stats, setStats] = useState({
        occupied: 0,
        reserved: 0,
        available: 0
    });

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await packageService.getAll({
                limit: 100,
                status: 'open' // Or filter as needed
            });
            if (response.success) {
                setPackagesList(response.data);
                // Select first package by default if available
                if (response.data.length > 0 && !selectedPaket) {
                    setSelectedPaket(response.data[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchJamaah = async (packageId) => {
        if (!packageId) return;

        try {
            setLoadingJamaah(true);
            const response = await jamaahService.getAll({
                packageId: packageId,
                limit: 1000 // Ensure we get all jamaah for the package
            });

            if (response.success) {
                setJamaahList(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch jamaah:', error);
            setJamaahList([]);
        } finally {
            setLoadingJamaah(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    useEffect(() => {
        if (selectedPaket) {
            fetchJamaah(selectedPaket);
        } else {
            setJamaahList([]);
        }
    }, [selectedPaket]);

    // Find selected package data
    const selectedPackageData = packagesList.find(p => p.id === selectedPaket);

    // Generate seat data based on package total seats and jamaah list
    const generateSeats = (pkgData, jamaahs) => {
        if (!pkgData) return [];

        // Default to a reasonable number if totalSeats is not set or valid
        const kuota = pkgData.totalSeats || 45;
        const rows = Math.ceil(kuota / 5);
        const seats = [];
        const rowLabels = 'ABCDEFGHIJ'.split(''); // Extend if needed for > 50 seats

        for (let row = 0; row < rows; row++) {
            for (let col = 1; col <= 5; col++) {
                const seatNum = row * 5 + col;

                // Stop if we exceed quota
                if (seatNum <= kuota) {
                    // Start rowStatus as 'available'
                    let status = 'available';
                    let jamaahName = null;
                    let jamaahId = null;

                    // Find if any jamaah has this seat number
                    // Assuming j.seatNumber is 1-based index matching our loop
                    const occupant = jamaahs.find(j => j.seatNumber === seatNum);

                    if (occupant) {
                        status = 'occupied';
                        // Use available name fields
                        jamaahName = occupant.name || occupant.fullName;
                        jamaahId = occupant.id;
                    }

                    seats.push({
                        id: `${rowLabels[row] || '?'}${col}`,
                        row: rowLabels[row] || '?',
                        col,
                        seatIndex: seatNum,
                        status,
                        jamaah: jamaahName,
                        jamaahId: jamaahId
                    });
                }
            }
        }
        return seats;
    };

    const seats = selectedPackageData ? generateSeats(selectedPackageData, jamaahList) : [];

    // Update stats when seats change
    useEffect(() => {
        const newStats = {
            occupied: seats.filter(s => s.status === 'occupied').length,
            reserved: seats.filter(s => s.status === 'reserved').length,
            available: seats.filter(s => s.status === 'available').length,
        };
        setStats(newStats);
    }, [seats.length, selectedPaket, jamaahList.length]);

    const getSeatColor = (status) => {
        switch (status) {
            case 'occupied':
                return 'bg-emerald-500/80 border-emerald-400 text-white cursor-not-allowed';
            case 'reserved':
                return 'bg-amber-500/80 border-amber-400 text-white cursor-pointer hover:bg-amber-500';
            case 'available':
                return 'bg-surface-glass border-surface-border text-gray-400 cursor-pointer hover:bg-primary-500/50 hover:border-primary-400';
            default:
                return 'bg-surface-glass border-surface-border text-gray-400';
        }
    };



    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Kontrol Seat</h1>
                <p className="text-sm text-gray-500 mt-1">Kelola alokasi seat per paket</p>
            </div>

            {/* Package Selector & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                    <Card className="!p-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Pilih Paket
                        </label>
                        <div className="relative">
                            <Plane className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <select
                                className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 appearance-none"
                                value={selectedPaket}
                                onChange={(e) => setSelectedPaket(e.target.value)}
                                disabled={loading}
                            >
                                <option value="">Pilih Paket</option>
                                {packagesList.map((pkg) => (
                                    <option key={pkg.id} value={pkg.id}>
                                        {pkg.code} - {pkg.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </Card>
                </div>
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.occupied}</p>
                            <p className="text-xs text-gray-500">Terisi</p>
                        </div>
                    </div>
                </Card>
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.available}</p>
                            <p className="text-xs text-gray-500">Tersedia</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Seat Legend */}
            <Card className="!p-4">
                <div className="flex flex-wrap items-center gap-6">
                    <span className="text-sm text-gray-400">Keterangan:</span>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-emerald-500/80 border border-emerald-400" />
                        <span className="text-sm text-gray-400">Terisi ({stats.occupied})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-amber-500/80 border border-amber-400" />
                        <span className="text-sm text-gray-400">Reserved ({stats.reserved})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-surface-glass border border-surface-border" />
                        <span className="text-sm text-gray-400">Tersedia ({stats.available})</span>
                    </div>
                </div>
            </Card>

            {/* Seat Map */}
            <Card title="Peta Seat" subtitle={`${selectedPackageData?.nama || 'Pilih paket'}`}>
                <div className="flex flex-col items-center">
                    {/* Front indicator */}
                    <div className="w-48 h-8 bg-surface-glass rounded-t-3xl border border-b-0 border-surface-border flex items-center justify-center mb-6">
                        <span className="text-xs text-gray-500 font-medium">DEPAN</span>
                    </div>

                    {/* Seat Grid */}
                    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                        {seats.map((seat) => (
                            <button
                                key={seat.id}
                                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all duration-200 ${getSeatColor(seat.status)}`}
                                title={seat.jamaah || 'Tersedia'}
                                disabled={seat.status === 'occupied'}
                            >
                                {seat.id}
                            </button>
                        ))}
                    </div>

                    {/* Row labels */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">Klik seat untuk melihat detail atau mengubah status</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SeatControl;
