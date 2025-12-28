
import React, { useState, useEffect } from 'react';
import { Plane, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../../components/molecules/Card';
import RoomListPage from './RoomListPage';
import { usePackages } from '../../hooks/usePackages';

const RoomListIndex = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedPaket, setSelectedPaket] = useState('');

    // Fetch packages
    const { data: paketData, isLoading } = usePackages({
        limit: 100,
        status: 'open'
    });

    const packagesList = paketData?.data || [];

    // Effect to handle URL param if any (though we are creating a generic page)
    useEffect(() => {
        if (packagesList.length > 0 && !selectedPaket) {
            setSelectedPaket(packagesList[0].id);
        }
    }, [packagesList]);

    // Handle package change by navigating?? 
    // Actually, RoomListPage expects `useParams`.
    // So if I embed RoomListPage directly here, I need to make sure RoomListPage can handle `packageId` prop OR params.
    // Let's modify RoomListPage to accept `packageId` prop as an override.

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header px-6 pt-6">
                <h1 className="page-title">Room List</h1>
                <p className="text-sm text-gray-500 mt-1">Kelola pembagian kamar jamaah per paket</p>
            </div>

            <div className="px-6">
                <Card className="!p-4 mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Pilih Paket
                    </label>
                    <div className="relative">
                        <Plane className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <select
                            className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 appearance-none"
                            value={selectedPaket}
                            onChange={(e) => setSelectedPaket(e.target.value)}
                            disabled={isLoading}
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

            {selectedPaket ? (
                /* We will need to modify RoomListPage to accept packageId via props */
                <RoomListPage packageIdOverride={selectedPaket} />
            ) : (
                <div className="px-6">
                    <div className="text-center py-12 bg-dark-tertiary rounded-xl border border-surface-border border-dashed">
                        <p className="text-gray-500">Silakan pilih paket untuk mengelola room list</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomListIndex;
