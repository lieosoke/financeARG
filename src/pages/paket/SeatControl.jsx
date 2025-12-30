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

    // Modal state
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [selectedJamaahId, setSelectedJamaahId] = useState('');

    const [stats, setStats] = useState({
        occupied: 0,
        reserved: 0,
        available: 0,
        unassigned: 0,
        male: 0,
        female: 0
    });

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await packageService.getAll({
                limit: 100,
                status: 'open'
            });
            if (response.success) {
                setPackagesList(response.data);
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
                limit: 1000
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

    // Generate seat data
    const generateSeats = (pkgData, jamaahs) => {
        if (!pkgData) return [];

        const kuota = pkgData.totalSeats || 45;
        const rows = Math.ceil(kuota / 5);
        const seats = [];
        const rowLabels = 'ABCDEFGHIJ'.split('');

        for (let row = 0; row < rows; row++) {
            for (let col = 1; col <= 5; col++) {
                const seatNum = row * 5 + col;

                if (seatNum <= kuota) {
                    let status = 'available';
                    let jamaahName = null;
                    let jamaahId = null;

                    // Find if any jamaah has this seat number
                    const occupant = jamaahs.find(j => j.seatNumber === seatNum);

                    if (occupant) {
                        status = 'occupied';
                        jamaahName = occupant.name;
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

    // Update stats
    useEffect(() => {
        const occupiedCount = seats.filter(s => s.status === 'occupied').length;
        const totalJamaah = jamaahList.length;
        const unassignedCount = totalJamaah - occupiedCount;

        const maleCount = jamaahList.filter(j => j.gender === 'male').length;
        const femaleCount = jamaahList.filter(j => j.gender === 'female').length;

        const newStats = {
            occupied: occupiedCount,
            reserved: seats.filter(s => s.status === 'reserved').length,
            available: seats.filter(s => s.status === 'available').length,
            unassigned: unassignedCount < 0 ? 0 : unassignedCount,
            male: maleCount,
            female: femaleCount
        };
        setStats(newStats);
    }, [seats.length, selectedPaket, jamaahList]);

    const getSeatColor = (status) => {
        switch (status) {
            case 'occupied':
                return 'bg-emerald-500/80 border-emerald-400 text-white cursor-pointer';
            case 'reserved':
                return 'bg-amber-500/80 border-amber-400 text-white cursor-pointer hover:bg-amber-500';
            case 'available':
                return 'bg-surface-glass border-surface-border text-gray-400 cursor-pointer hover:bg-primary-500/50 hover:border-primary-400';
            default:
                return 'bg-surface-glass border-surface-border text-gray-400';
        }
    };

    // Handler when clicking a seat
    const handleSeatClick = (seat) => {
        setSelectedSeat(seat);
        if (seat.jamaahId) {
            setSelectedJamaahId(seat.jamaahId); // Pre-select current occupant
        } else {
            setSelectedJamaahId('');
        }
        setIsModalOpen(true);
    };

    // Handle assigning/unassigning seat
    const handleSaveAssignment = async () => {
        if (!selectedSeat) return;
        setAssignmentLoading(true);

        try {
            // 1. If currently occupied, clear the previous occupant's seat
            if (selectedSeat.jamaahId) {
                // If we are just changing the person, or unassigning
                // We need to set the old occupant's seatNumber to null
                await jamaahService.update(selectedSeat.jamaahId, { seatNumber: null });
            }

            // 2. If a new jamaah is selected, assign them to this seat
            if (selectedJamaahId) {
                // Check if this jamaah already has a seat (optional safety, though UI should handle it)
                const currentJamaah = jamaahList.find(j => j.id === selectedJamaahId);
                /* 
                   Note: The backend/service could handle swapping if needed, 
                   but for simplicity we just update the target jamaah's seatNumber.
                   If they had another seat, it will be overwritten (moved).
                   Ideally we should clear their old seat first effectively.
                */

                await jamaahService.update(selectedJamaahId, { seatNumber: selectedSeat.seatIndex });
            }

            // Refresh data
            await fetchJamaah(selectedPaket);
            setIsModalOpen(false);
            setSelectedSeat(null);
            setSelectedJamaahId('');
        } catch (error) {
            console.error('Failed to update seat assignment:', error);
            alert('Gagal mengubah status seat. Silakan coba lagi.');
        } finally {
            setAssignmentLoading(false);
        }
    };

    // Filter available jamaah for dropdown (those without seats OR the current occupant)
    const availableJamaah = jamaahList.filter(j =>
        !j.seatNumber || (selectedSeat && j.id === selectedSeat.jamaahId)
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Kontrol Seat</h1>
                <p className="text-sm text-gray-500 mt-1">Kelola alokasi seat per paket</p>
            </div>

            {/* Package Selector & Stats */}
            {/* Package Selector & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-1 md:col-span-2">
                    <Card className="!p-4 h-full">
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

                {/* Unassigned Card */}
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.unassigned > 0 ? 'bg-amber-500/20' : 'bg-surface-tertiary'}`}>
                            <Users className={`w-5 h-5 ${stats.unassigned > 0 ? 'text-amber-400' : 'text-gray-400'}`} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${stats.unassigned > 0 ? 'text-amber-400' : 'text-gray-400'}`}>{stats.unassigned}</p>
                            <p className="text-xs text-gray-500">Belum Dapat Seat</p>
                        </div>
                    </div>
                </Card>

                {/* Gender Distribution */}
                <Card className="!p-4">
                    <div className="flex items-center justify-between h-full">
                        <div className="text-center">
                            <p className="text-lg font-bold text-blue-400">{stats.male}</p>
                            <p className="text-[10px] text-gray-500 uppercase">Pria</p>
                        </div>
                        <div className="h-8 w-[1px] bg-surface-border"></div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-pink-400">{stats.female}</p>
                            <p className="text-[10px] text-gray-500 uppercase">Wanita</p>
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
                    {/* <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-amber-500/80 border border-amber-400" />
                        <span className="text-sm text-gray-400">Reserved ({stats.reserved})</span>
                    </div> */}
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-surface-glass border border-surface-border" />
                        <span className="text-sm text-gray-400">Tersedia ({stats.available})</span>
                    </div>
                </div>
            </Card>

            {/* Seat Map */}
            <Card title="Peta Seat" subtitle={`${selectedPackageData?.name || 'Pilih paket'}`}>
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
                                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all duration-200 relative group ${getSeatColor(seat.status)}`}
                                title={seat.jamaah ? `${seat.id}: ${seat.jamaah}` : `${seat.id}: Tersedia`}
                                onClick={() => handleSeatClick(seat)}
                            >
                                {seat.id}
                                {seat.status === 'occupied' && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" title="Terisi" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Row labels */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">Klik seat untuk melihat detail atau mengubah status</p>
                    </div>
                </div>
            </Card>

            {/* Assignment Modal */}
            {isModalOpen && selectedSeat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-dark-secondary border border-surface-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-in">
                        <div className="flex justify-between items-center pb-4 border-b border-surface-border">
                            <h3 className="text-lg font-bold text-white">
                                Atur Seat {selectedSeat.id}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Status Saat Ini
                                </label>
                                <div className={`p-3 rounded-lg border ${selectedSeat.status === 'occupied' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-surface-glass border-surface-border text-gray-400'}`}>
                                    {selectedSeat.status === 'occupied' ? (
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            <span>Terisi oleh: <strong>{selectedSeat.jamaah}</strong></span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                                            <span>Available</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Assign Jamaah
                                </label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                                    value={selectedJamaahId}
                                    onChange={(e) => setSelectedJamaahId(e.target.value)}
                                >
                                    <option value="">-- Kosongkan Seat --</option>
                                    {availableJamaah.map(j => (
                                        <option key={j.id} value={j.id}>
                                            {j.name} {j.seatIndex ? `(Pindah dari: ${j.seatNumber})` : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    Pilih jamaah untuk mengisi seat ini. Pilih opsi kosong untuk mengosongkan seat.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-gray-300 hover:bg-surface-hover transition-colors"
                                disabled={assignmentLoading}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSaveAssignment}
                                disabled={assignmentLoading}
                                className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors flex items-center gap-2"
                            >
                                {assignmentLoading ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>Simpan Perubahan</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeatControl;
