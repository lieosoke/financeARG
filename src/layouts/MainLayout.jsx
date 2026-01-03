import React, { useState, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/organisms/Sidebar';
import TopNavbar from '../components/organisms/TopNavbar';
import { useCompanySettings } from '../hooks/useCompanySettings';
import pkg from '../../package.json';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { data: companySettingsData } = useCompanySettings();

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
            <div className="lg:ml-64 min-h-screen flex flex-col">
                {/* Top Navbar */}
                <TopNavbar onMenuClick={toggleSidebar} pageTitle={pageTitle} />

                {/* Page Content */}
                <main className="pt-16 flex-grow">
                    <div className="p-4 md:p-6">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <footer className="w-full py-6 px-6 border-t border-surface-border bg-dark-secondary/30 backdrop-blur-sm mt-auto z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                        <div className="mb-2 md:mb-0">
                            &copy; {new Date().getFullYear()} <span className="font-medium text-gray-400">{companySettingsData?.data?.name || 'ARG App'}</span>. All rights reserved.
                        </div>
                        <div className="flex items-center gap-4">
                            <span>v{pkg.version}</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default MainLayout;
