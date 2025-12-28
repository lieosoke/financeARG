import React, { useState, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/organisms/Sidebar';
import TopNavbar from '../components/organisms/TopNavbar';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Dynamic page title based on route
    const pageTitle = useMemo(() => {
        const path = location.pathname;
        const titles = {
            '/dashboard': 'Dashboard',
            '/jamaah': 'Data Jamaah',
            '/jamaah/baru': 'Tambah Jamaah',
            '/paket': 'Daftar Paket',
            '/paket/baru': 'Buat Paket Baru',
            '/manifest': 'Manifest Keberangkatan',
            '/seat': 'Kontrol Seat',
            '/keuangan/cashflow': 'Arus Kas',
            '/keuangan/pemasukan': 'Pemasukan',
            '/keuangan/pengeluaran': 'Pengeluaran',
            '/keuangan/hutang': 'Hutang Vendor',
            '/laporan/labarugi': 'Laba/Rugi per Paket',
            '/laporan/budget': 'Budget vs Actual',
            '/laporan/invoice': 'Invoice Generator',
            '/laporan/audit': 'Audit Log',
            '/notifications': 'Notifikasi',
            '/profile': 'Profil Saya',
            '/settings/users': 'User Management',
            '/settings/roles': 'Role & Permission',
        };

        // Check if path matches an edit route pattern (e.g., /jamaah/:id or /paket/:id)
        if (path.match(/^\/jamaah\/\d+$/)) return 'Edit Jamaah';
        if (path.match(/^\/paket\/\d+$/)) return 'Edit Paket';

        return titles[path] || 'Dashboard';
    }, [location.pathname]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-dark-primary bg-gradient-mesh">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

            {/* Main Content Area */}
            <div className="lg:ml-64">
                {/* Top Navbar */}
                <TopNavbar onMenuClick={toggleSidebar} pageTitle={pageTitle} />

                {/* Page Content */}
                <main className="pt-16 min-h-screen">
                    <div className="p-4 md:p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
