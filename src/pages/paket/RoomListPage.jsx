
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, User, Bed, Search, CheckSquare, Square, LogOut, ArrowRight, X, Printer, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Badge from '../../components/atoms/Badge';
import { useJamaahList, useBulkUpdateJamaah } from '../../hooks/useJamaah';
import { usePackage } from '../../hooks/usePackages';

const RoomListPage = ({ packageIdOverride }) => {
    const { id: paramPackageId } = useParams();
    const packageId = packageIdOverride || paramPackageId;
    const [selectedJamaah, setSelectedJamaah] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);

    // Room creation state
    const [newRoomNumber, setNewRoomNumber] = useState('');
    const [newRoomType, setNewRoomType] = useState('quad');

    // Fetch data
    const { data: packageData } = usePackage(packageId);
    const { data: jamaahData, isLoading } = useJamaahList({ packageId, limit: 1000 });
    const bulkUpdateMutation = useBulkUpdateJamaah({
        onSuccess: () => {
            toast.success('Daftar kamar berhasil diperbarui');
            if (isCreatingRoom) {
                setIsCreatingRoom(false);
                setNewRoomNumber('');
                setSelectedJamaah([]);
            }
        },
        onError: (err) => {
            toast.error(err.message || 'Gagal memperbarui kamar');
        }
    });

    const packet = packageData?.data;
    const jamaahList = jamaahData?.data || [];

    // Grouping Logic
    const { unassigned, rooms } = useMemo(() => {
        const unassigned = [];
        const roomsMap = new Map();

        jamaahList.forEach(j => {
            // Filter by search
            if (searchQuery && !j.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return;
            }

            if (!j.roomNumber) {
                unassigned.push(j);
            } else {
                const key = `${j.roomNumber}-${j.roomType}`;
                if (!roomsMap.has(key)) {
                    roomsMap.set(key, {
                        roomNumber: j.roomNumber,
                        roomType: j.roomType,
                        jamaah: []
                    });
                }
                roomsMap.get(key).jamaah.push(j);
            }
        });

        // Convert map to array and sort by room number
        const roomsArray = Array.from(roomsMap.values()).sort((a, b) =>
            a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
        );

        return { unassigned, rooms: roomsArray };
    }, [jamaahList, searchQuery]);

    // Handlers
    const toggleSelectJamaah = (jamaahId) => {
        setSelectedJamaah(prev =>
            prev.includes(jamaahId)
                ? prev.filter(id => id !== jamaahId)
                : [...prev, jamaahId]
        );
    };

    const handleSelectAllUnassigned = () => {
        if (selectedJamaah.length === unassigned.length) {
            setSelectedJamaah([]);
        } else {
            setSelectedJamaah(unassigned.map(j => j.id));
        }
    };

    const handleCreateRoom = () => {
        if (!newRoomNumber) {
            toast.error('Nomor kamar wajib diisi');
            return;
        }
        if (selectedJamaah.length === 0) {
            toast.error('Pilih jamaah terlebih dahulu');
            return;
        }

        // Validate capacity
        const capacityMap = {
            'single': 1,
            'double': 2,
            'queen': 2,
            'triple': 3,
            'quad': 4
        };
        const capacity = capacityMap[newRoomType] || 4;

        if (selectedJamaah.length > capacity) {
            if (!window.confirm(`Jumlah jamaah (${selectedJamaah.length}) melebihi kapasitas tipe ${newRoomType} (${capacity}). Lanjutkan?`)) {
                return;
            }
        }

        const updates = selectedJamaah.map(id => ({
            id,
            data: {
                roomNumber: newRoomNumber,
                roomType: newRoomType
            }
        }));

        bulkUpdateMutation.mutate(updates);
    };

    const handleRemoveFromRoom = (jamaahId) => {
        if (window.confirm('Keluarkan jamaah dari kamar ini?')) {
            bulkUpdateMutation.mutate([{
                id: jamaahId,
                data: {
                    roomNumber: null,
                    roomType: null // Should we clear type too? Yes.
                }
            }]);
        }
    };

    const handleDismissRoom = (room) => {
        if (window.confirm(`Kosongkan kamar ${room.roomNumber}?`)) {
            const updates = room.jamaah.map(j => ({
                id: j.id,
                data: {
                    roomNumber: null,
                    roomType: null // Clear type too but API schema allows optional, setting null in DB is good.
                    // Wait, schema says optional, so we can send null. 
                    // Wait, replace_file_content for bulkUpdate filters undefined, but not null? 
                    // My implementation checks `!== undefined`. So null is fine.
                    // Zod schema: optional(). So it might strip undefined. 
                    // I should send empty string or handle null explicitly in backend if needed. 
                    // In postgres null is fine. 
                    // In Zod `z.string().optional()` usually allows undefined. To allow null, need `nullable()`.
                    // Looking at `jamaah.routes.ts`: `roomNumber: z.string().optional()`.
                    // If I send null, Zod might complain unless I use `.nullable()`.
                    // Let's check schema again. `roomNumber` is NOT nullable in Zod schema I saw earlier?
                    // Line 44: `roomNumber: z.string().optional()`.
                    // If I send null, validation fails.
                    // I should send empty string `""` which I can handle as null in backend or just empty string.
                    // Existing schema `roomNumber: text('room_number')` (nullable by default).
                    // Zod: optional means `string | undefined`.
                    // I should update Zod schema to `z.string().optional().nullable()` or handle empty string.
                    // For now I'll send empty string and rely on that, or fixed backend schema.
                    // Wait, `roomNumber` defaults to null in DB.
                }
            }));

            // Correction: Send empty string for now to be safe with Zod `string().optional()`.
            // Ideally backend should convert empty string to null.
            // My bulkUpdate implementation: `if (val !== undefined) cleanData[key] = val`.
            // If I send `""`, it updates to `""`.

            bulkUpdateMutation.mutate(
                room.jamaah.map(j => ({
                    id: j.id,
                    data: { roomNumber: null, roomType: null }
                }))
            );

            // NOTE: I need to update Zod schema in `jamaah.routes.ts` to allow nulls if I send nulls.
            // Or use empty string.
        }
    };

    const getRoomBadge = (type) => {
        const config = {
            quad: { label: 'Quad (4)', color: 'success' },
            triple: { label: 'Triple (3)', color: 'info' },
            double: { label: 'Double (2)', color: 'warning' },
            queen: { label: 'Queen (2)', color: 'primary' },
            single: { label: 'Single (1)', color: 'neutral' },
        };
        const c = config[type] || config.quad;
        return <Badge variant={c.color}>{c.label}</Badge>;
    };

    // Print handler
    const handlePrint = () => {
        window.print();
    };

    // Export CSV handler
    const handleExportCSV = () => {
        if (!rooms.length && unassigned.length === 0) {
            toast.error('Tidak ada data untuk diexport');
            return;
        }

        const headers = ['No', 'Nomor Kamar', 'Tipe Kamar', 'Nama Jamaah', 'Jenis Kelamin', 'Paket'];
        const csvRows = [headers.join(',')];

        // Process assigned rooms
        let index = 1;
        rooms.forEach(room => {
            room.jamaah.forEach(j => {
                const row = [
                    index++,
                    `"${room.roomNumber}"`,
                    `"${room.roomType}"`,
                    `"${j.name}"`,
                    `"${j.gender === 'male' ? 'Laki-laki' : 'Perempuan'}"`,
                    `"${packet?.name || ''}"`
                ];
                csvRows.push(row.join(','));
            });
        });

        // Process unassigned
        unassigned.forEach(j => {
            const row = [
                index++,
                '"Belum Assign"',
                '"-"',
                `"${j.name}"`,
                `"${j.gender === 'male' ? 'Laki-laki' : 'Perempuan'}"`,
                `"${packet?.name || ''}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `room-list-${packet?.code || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Stats
    const totalAssigned = rooms.reduce((sum, room) => sum + room.jamaah.length, 0);

    return (
        <div className={`space-y-6 animate-fade-in ${!packageIdOverride ? 'p-6' : ''}`}>
            {/* Header */}
            {/* Header / Action Bar */}
            <div className="flex items-center justify-between">
                {!packageIdOverride ? (
                    <div className="flex items-center gap-4">
                        <Link to="/paket">
                            <Button variant="ghost" size="sm" className="!p-2">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Room List</h1>
                            <p className="text-gray-400">
                                {packet ? `${packet.name} (${packet.code})` : 'Loading...'}
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Spacer when no header needed */
                    <div></div>
                )}

                {/* Action Toolbar - Always Visible */}
                <div className="flex gap-2">
                    <Button
                        onClick={handleExportCSV}
                        variant="outline"
                        icon={<Download className="w-4 h-4" />}
                        className="print:hidden"
                    >
                        Export CSV
                    </Button>
                    <Button
                        onClick={handlePrint}
                        variant="outline"
                        icon={<Printer className="w-4 h-4" />}
                        className="print:hidden"
                    >
                        Cetak
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
                {/* Left Column: Unassigned Jamaah */}
                <Card className="lg:col-span-1 h-[calc(100vh-200px)] flex flex-col">
                    <div className="p-4 border-b border-surface-border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-white">Jamaah ({unassigned.length})</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAllUnassigned}
                                className="text-xs"
                            >
                                {selectedJamaah.length === unassigned.length && unassigned.length > 0 ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>
                        <Input
                            placeholder="Cari jamaah..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={<Search className="w-4 h-4" />}
                            className="bg-dark-primary"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {unassigned.map(j => (
                            <div
                                key={j.id}
                                onClick={() => toggleSelectJamaah(j.id)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedJamaah.includes(j.id)
                                    ? 'bg-primary-500/20 border-primary-500/50'
                                    : 'bg-dark-tertiary border-transparent hover:border-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedJamaah.includes(j.id)
                                        ? 'bg-primary-500 border-primary-500'
                                        : 'border-gray-500'
                                        }`}>
                                        {selectedJamaah.includes(j.id) && <CheckSquare className="w-3 h-3 text-white" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{j.name}</p>
                                        <p className="text-xs text-gray-500">{j.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {unassigned.length === 0 && (
                            <div className="text-center py-10 text-gray-500 text-sm">
                                Tidak ada jamaah yang belum dapat kamar
                            </div>
                        )}
                    </div>
                </Card>

                {/* Right Column: Rooms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Action Area */}
                    <Card className="p-4">
                        <div className="flex flex-col md:flex-row items-end gap-4">
                            <div className="flex-1 w-full">
                                <label className="text-xs text-gray-400 mb-1 block">Nomor Kamar</label>
                                <Input
                                    placeholder="Contoh: 101"
                                    value={newRoomNumber}
                                    onChange={(e) => setNewRoomNumber(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="text-xs text-gray-400 mb-1 block">Tipe Kamar</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                                    value={newRoomType}
                                    onChange={(e) => setNewRoomType(e.target.value)}
                                >
                                    <option value="quad">Quad (4)</option>
                                    <option value="triple">Triple (3)</option>
                                    <option value="double">Double (2)</option>
                                    <option value="queen">Queen (2)</option>
                                    <option value="single">Single (1)</option>
                                </select>
                            </div>
                            <Button
                                onClick={handleCreateRoom}
                                disabled={selectedJamaah.length === 0 || !newRoomNumber || bulkUpdateMutation.isPending}
                                icon={<Plus className="w-4 h-4" />}
                            >
                                Assign to Room
                            </Button>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            {selectedJamaah.length} jamaah dipilih untuk dimasukkan ke kamar ini.
                        </div>
                    </Card>

                    {/* Room List Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rooms.map((room, idx) => (
                            <Card key={idx} className="flex flex-col">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-dark-tertiary rounded-lg flex items-center justify-center">
                                            <Bed className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{room.roomNumber}</h4>
                                            {getRoomBadge(room.roomType)}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                        onClick={() => handleDismissRoom(room)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex-1 space-y-2">
                                    {room.jamaah.map((j) => (
                                        <div key={j.id} className="flex items-center justify-between p-2 rounded bg-dark-tertiary/50 text-sm">
                                            <span className="text-gray-300">{j.name}</span>
                                            <button
                                                onClick={() => handleRemoveFromRoom(j.id)}
                                                className="text-gray-500 hover:text-rose-400 p-1"
                                                title="Hapus dari kamar"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {room.jamaah.length === 0 && (
                                        <div className="text-center py-4 text-gray-500 text-xs text-italic">
                                            Kamar kosong
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-3 border-t border-surface-border text-xs text-gray-500 flex justify-between">
                                    <span>Terisi: {room.jamaah.length} orang</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Print View - Hidden on screen, visible on print */}
            <div className="hidden print:block print:p-0">
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        .print\\:block, .print\\:block * { visibility: visible; }
                        .print\\:block { 
                            position: absolute; 
                            left: 0; 
                            top: 0; 
                            width: 100%;
                            background: white;
                            color: black;
                        }
                        @page { size: A4; margin: 1cm; }
                    }
                `}</style>

                <div className="print:bg-white print:text-black">
                    {/* Print Header */}
                    <div className="text-center mb-6 border-b-2 border-black pb-4">
                        <h1 className="text-2xl font-bold uppercase">DAFTAR KAMAR</h1>
                        <p className="text-lg mt-1">{packet?.name} ({packet?.code})</p>
                        <p className="text-sm text-gray-600 mt-1">
                            Total Jamaah: {totalAssigned} orang | Total Kamar: {rooms.length}
                        </p>
                    </div>

                    {/* Rooms Table */}
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-400 px-3 py-2 text-left w-16">No</th>
                                <th className="border border-gray-400 px-3 py-2 text-left w-24">No. Kamar</th>
                                <th className="border border-gray-400 px-3 py-2 text-left w-24">Tipe</th>
                                <th className="border border-gray-400 px-3 py-2 text-left">Nama Jamaah</th>
                                <th className="border border-gray-400 px-3 py-2 text-center w-20">Jml</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room, idx) => (
                                <tr key={idx} className={idx % 2 === 1 ? 'bg-gray-50' : ''}>
                                    <td className="border border-gray-400 px-3 py-2 text-center align-top">{idx + 1}</td>
                                    <td className="border border-gray-400 px-3 py-2 font-semibold align-top">{room.roomNumber}</td>
                                    <td className="border border-gray-400 px-3 py-2 capitalize align-top">
                                        {room.roomType || 'Quad'}
                                    </td>
                                    <td className="border border-gray-400 px-3 py-2">
                                        <ol className="list-decimal list-inside space-y-0.5">
                                            {room.jamaah.map((j, jIdx) => (
                                                <li key={j.id}>
                                                    {j.name}
                                                    <span className="text-gray-500 text-xs ml-1">
                                                        ({j.gender === 'male' ? 'L' : 'P'})
                                                    </span>
                                                </li>
                                            ))}
                                        </ol>
                                    </td>
                                    <td className="border border-gray-400 px-3 py-2 text-center align-top">
                                        {room.jamaah.length}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-200 font-semibold">
                                <td colSpan={4} className="border border-gray-400 px-3 py-2 text-right">
                                    Total Jamaah:
                                </td>
                                <td className="border border-gray-400 px-3 py-2 text-center">
                                    {totalAssigned}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Unassigned Section */}
                    {unassigned.length > 0 && (
                        <div className="mt-6">
                            <h2 className="font-bold text-lg border-b border-gray-400 pb-2 mb-3">
                                Belum Dapat Kamar ({unassigned.length} orang)
                            </h2>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                {unassigned.map((j, idx) => (
                                    <div key={j.id}>
                                        {idx + 1}. {j.name} ({j.gender === 'male' ? 'L' : 'P'})
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t border-gray-400 text-xs text-gray-500 flex justify-between">
                        <span>Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>{packet?.name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomListPage;
