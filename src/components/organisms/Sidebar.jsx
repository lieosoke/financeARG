import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Package,
    Wallet,
    Bed,
    FileText,
    Settings,
    ChevronDown,
    ChevronRight,
    X,
    Sparkles,
    Building2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { canAccessMenu, getRoleConfig } from '../../config/permissions';
import { useCompanySettings } from '../../hooks/useCompanySettings';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const [expandedMenu, setExpandedMenu] = useState({});
    const { user } = useAuth();

    // User role from context
    const userRole = user?.role || 'admin';
    const roleInfo = getRoleConfig(userRole);

    // Fetch company settings for dynamic company name
    const { data: companySettingsData } = useCompanySettings();
    const companyName = companySettingsData?.data?.name || 'ARG App';

    const allMenuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            path: '/dashboard',
        },
        {
            id: 'jamaah',
            label: 'Data Jamaah',
            icon: Users,
            children: [
                { label: 'Daftar Jamaah', path: '/jamaah' },
                { label: 'Tambah Jamaah', path: '/jamaah/baru' },
            ],
        },
        {
            id: 'paket',
            label: 'Manajemen Paket',
            icon: Package,
            children: [
                { label: 'Daftar Paket', path: '/paket' },
                { label: 'Buat Paket Baru', path: '/paket/baru' },
                { label: 'Manifest Keberangkatan', path: '/manifest' },
                { label: 'Kontrol Seat', path: '/seat' },
                { label: 'Room List', path: '/roomlist' },
            ],
        },
        {
            id: 'keuangan',
            label: 'Keuangan',
            icon: Wallet,
            children: [
                { label: 'Arus Kas', path: '/keuangan/cashflow' },
                { label: 'Pemasukan', path: '/keuangan/pemasukan' },
                { label: 'Pengeluaran', path: '/keuangan/pengeluaran' },
                { label: 'Hutang Vendor', path: '/keuangan/hutang' },
            ],
        },
        {
            id: 'laporan',
            label: 'Laporan',
            icon: FileText,
            children: [
                { label: 'Laba/Rugi per Paket', path: '/laporan/labarugi' },
                { label: 'Budget vs Actual', path: '/laporan/budget' },
                { label: 'Invoice Generator', path: '/laporan/invoice' },
                { label: 'Audit Log', path: '/laporan/audit' },
            ],
        },
        {
            id: 'vendor',
            label: 'Manajemen Vendor',
            icon: Building2,
            path: '/vendor',
        },
        {
            id: 'settings',
            label: 'Pengaturan',
            icon: Settings,
            children: [
                { label: 'User Management', path: '/settings/users' },
                { label: 'Role & Permission', path: '/settings/roles' },
                { label: 'Pengaturan Perusahaan', path: '/settings/company' },
            ],
        },
    ];

    // Filter menu items based on user role
    const menuItems = allMenuItems.filter(item => canAccessMenu(userRole, item.id));

    const toggleSubmenu = (menuId) => {
        setExpandedMenu(prev => ({
            ...prev,
            [menuId]: !prev[menuId],
        }));
    };

    const isActiveMenu = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // Get user initials
    const getInitials = () => {
        if (user?.name) {
            return user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        }
        if (user?.email) {
            return user.email.substring(0, 2).toUpperCase();
        }
        return 'US';
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen w-64 z-50
                    bg-dark-secondary/90 backdrop-blur-2xl
                    border-r border-surface-border
                    transform transition-transform duration-300 ease-out
                    lg:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Logo Header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-surface-border">
                    <Link to="/dashboard" className="flex items-center group">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-glow-emerald-sm group-hover:shadow-glow-emerald transition-shadow duration-300">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-3">
                            <span className="text-lg font-bold text-white font-display">{companyName}</span>
                            <span className="block text-[10px] text-primary-400 font-medium tracking-wide">FINANCE</span>
                        </div>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-glass transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin h-[calc(100vh-8rem)]">
                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const hasChildren = item.children && item.children.length > 0;
                            const isExpanded = expandedMenu[item.id];
                            const isActive = hasChildren
                                ? item.children.some(child => isActiveMenu(child.path))
                                : isActiveMenu(item.path);

                            return (
                                <div key={item.id}>
                                    {hasChildren ? (
                                        <>
                                            <button
                                                onClick={() => toggleSubmenu(item.id)}
                                                className={`
                                                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                                                    text-sm font-medium transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-surface-glass-active text-white'
                                                        : 'text-gray-400 hover:bg-surface-glass hover:text-gray-200'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center">
                                                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary-400' : ''}`} />
                                                    <span>{item.label}</span>
                                                </div>
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                            </button>

                                            <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-96 mt-1' : 'max-h-0'}`}>
                                                <div className="ml-4 pl-4 border-l border-surface-border space-y-1">
                                                    {item.children.map((child) => (
                                                        <Link
                                                            key={child.path}
                                                            to={child.path}
                                                            className={`
                                                                block px-3 py-2 rounded-lg text-sm
                                                                transition-all duration-200
                                                                ${isActiveMenu(child.path)
                                                                    ? 'text-primary-400 font-medium bg-primary-500/10'
                                                                    : 'text-gray-500 hover:text-gray-300 hover:bg-surface-glass'
                                                                }
                                                            `}
                                                            onClick={onClose}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            className={`
                                                w-full flex items-center px-3 py-2.5 rounded-xl
                                                text-sm font-medium transition-all duration-200
                                                ${isActive
                                                    ? 'menu-active text-white'
                                                    : 'text-gray-400 hover:bg-surface-glass hover:text-gray-200'
                                                }
                                            `}
                                            onClick={onClose}
                                        >
                                            <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary-400' : ''}`} />
                                            <span>{item.label}</span>
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </nav>

                {/* User Profile */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-surface-border p-4 bg-dark-secondary/50 backdrop-blur-xl">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold shadow-glow-emerald-sm">
                            {getInitials()}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500">{roleInfo.label}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-primary-500 shadow-glow-emerald-sm"></div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
