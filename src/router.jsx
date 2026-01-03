import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Jamaah Pages
import { JamaahList, JamaahForm } from './pages/jamaah';

// Paket Pages
import { PaketList, PaketForm, ManifestPage, SeatControl, RoomListPage, RoomListIndex } from './pages/paket';

// Keuangan Pages
import { CashflowPage, PemasukanPage, PengeluaranPage, HutangVendor } from './pages/keuangan';

// Laporan Pages
import { LabaRugiPage, BudgetActualPage, InvoiceGenerator, AuditLogPage } from './pages/laporan';

// Settings Pages
import { UserManagement, RolePermission, CompanySettings } from './pages/settings';

// Vendor Pages
import { VendorManagement } from './pages/vendor';

// Other Pages
import { NotificationsPage } from './pages/notifications';
import { ProfilePage } from './pages/profile';



export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <SignUp />,
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <MainLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />,
            },
            // Jamaah Routes
            {
                path: 'jamaah',
                element: <JamaahList />,
            },
            {
                path: 'jamaah/baru',
                element: <JamaahForm />,
            },
            {
                path: 'jamaah/:id',
                element: <JamaahForm />,
            },
            // Paket Routes
            {
                path: 'paket',
                element: <PaketList />,
            },
            {
                path: 'paket/baru',
                element: <PaketForm />,
            },
            {
                path: 'paket/:id',
                element: <PaketForm />,
            },
            {
                path: 'manifest',
                element: <ManifestPage />,
            },
            {
                path: 'seat',
                element: <SeatControl />,
            },
            {
                path: 'roomlist',
                element: <RoomListIndex />,
            },
            {
                path: 'paket/:id/roomlist',
                element: <RoomListPage />,
            },
            // Keuangan Routes
            {
                path: 'keuangan/cashflow',
                element: <CashflowPage />,
            },
            {
                path: 'keuangan/pemasukan',
                element: (
                    <ProtectedRoute requiredRoles={['owner', 'finance']}>
                        <PemasukanPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'keuangan/pengeluaran',
                element: (
                    <ProtectedRoute requiredRoles={['owner', 'finance']}>
                        <PengeluaranPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'keuangan/hutang',
                element: (
                    <ProtectedRoute requiredRoles={['owner', 'finance']}>
                        <HutangVendor />
                    </ProtectedRoute>
                ),
            },
            // Laporan Routes
            {
                path: 'laporan/labarugi',
                element: <LabaRugiPage />,
            },
            {
                path: 'laporan/budget',
                element: <BudgetActualPage />,
            },
            {
                path: 'laporan/invoice',
                element: <InvoiceGenerator />,
            },
            {
                path: 'laporan/audit',
                element: <AuditLogPage />,
            },
            // Vendor Routes
            {
                path: 'vendor',
                element: (
                    <ProtectedRoute requiredRoles={['owner', 'finance']}>
                        <VendorManagement />
                    </ProtectedRoute>
                ),
            },
            // Other Routes
            {
                path: 'notifications',
                element: <NotificationsPage />,
            },
            {
                path: 'profile',
                element: <ProfilePage />,
            },

            // Settings Routes (Owner only)
            {
                path: 'settings/users',
                element: (
                    <ProtectedRoute requiredRoles={['owner']}>
                        <UserManagement />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'settings/roles',
                element: (
                    <ProtectedRoute requiredRoles={['owner']}>
                        <RolePermission />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'settings/company',
                element: (
                    <ProtectedRoute requiredRoles={['owner']}>
                        <CompanySettings />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);

export default router;
