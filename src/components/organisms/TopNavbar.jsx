import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Moon, Sun, LogOut, User, Settings, Search, Command, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications, useMarkNotificationAsRead } from '../../hooks';
import SearchModal from './SearchModal';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';


const TopNavbar = ({ onMenuClick, pageTitle }) => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const notifRef = useRef(null);
    const userMenuRef = useRef(null);

    // Persist dark mode preference
    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        // You can add class toggle to html element here if needed
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcut for search (Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowSearch(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Fetch real notifications
    const { data: notificationsData, isLoading: notifLoading } = useNotifications({ limit: 5 });
    const markAsReadMutation = useMarkNotificationAsRead();

    const notifications = notificationsData?.data || [];
    const unreadCount = notificationsData?.unreadCount || 0;

    const getNotifDot = (type) => {
        const colors = {
            success: 'bg-emerald-500',
            warning: 'bg-amber-500',
            info: 'bg-blue-500',
            error: 'bg-rose-500',
        };
        return colors[type] || 'bg-gray-500';
    };

    const handleNotificationClick = (notif) => {
        if (!notif.isRead) {
            markAsReadMutation.mutate(notif.id);
        }
        if (notif.link) {
            navigate(notif.link);
            setShowNotifications(false);
        }
    };

    return (
        <>
            <header className="h-16 bg-dark-secondary/80 backdrop-blur-xl border-b border-surface-border fixed top-0 right-0 left-0 lg:left-64 z-30">
                <div className="h-full px-4 md:px-6 flex items-center justify-between">
                    {/* Left Side */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-surface-glass transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-white font-display">{pageTitle}</h1>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                        {/* Search Button */}
                        <button
                            onClick={() => setShowSearch(true)}
                            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-white bg-surface-glass hover:bg-surface-glass-hover border border-surface-border transition-colors"
                            title="Search (Ctrl+K)"
                        >
                            <Search className="w-4 h-4" />
                            <span className="text-sm">Cari...</span>
                            <kbd className="ml-2 px-1.5 py-0.5 text-xs rounded bg-dark-tertiary border border-surface-border text-gray-500">⌘K</kbd>
                        </button>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-surface-glass transition-colors"
                            title={darkMode ? 'Light Mode' : 'Dark Mode'}
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* Notifications */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-surface-glass transition-colors relative"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full shadow-glow-emerald-sm animate-pulse"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="dropdown-menu w-80">
                                    <div className="p-4 border-b border-surface-border">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-white">Notifikasi</h3>
                                            {unreadCount > 0 && (
                                                <span className="text-xs text-primary-400 font-medium">{unreadCount} baru</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto scrollbar-thin">
                                        {notifLoading ? (
                                            <div className="p-8 flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    className={`p-4 border-b border-surface-border hover:bg-surface-glass cursor-pointer transition-colors flex items-start gap-3 ${!notif.isRead ? 'bg-primary-500/5' : ''}`}
                                                    onClick={() => handleNotificationClick(notif)}
                                                >
                                                    <div className={`w-2 h-2 rounded-full mt-2 ${getNotifDot(notif.type)} ${!notif.isRead ? 'animate-pulse' : ''}`}></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm ${!notif.isRead ? 'text-white font-medium' : 'text-gray-200'}`}>{notif.title || notif.message}</p>
                                                        {notif.message && notif.title && (
                                                            <p className="text-xs text-gray-400 mt-0.5 truncate">{notif.message}</p>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: idLocale })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-3 border-t border-surface-border text-center">
                                        <button
                                            onClick={() => {
                                                navigate('/notifications');
                                                setShowNotifications(false);
                                            }}
                                            className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
                                        >
                                            Lihat Semua Notifikasi
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-surface-glass transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm shadow-glow-emerald-sm">
                                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'US'}
                                </div>
                                <span className="hidden md:block text-sm font-medium text-gray-300">{user?.name || 'User'}</span>
                            </button>

                            {showUserMenu && (
                                <div className="dropdown-menu w-56">
                                    <div className="p-4 border-b border-surface-border">
                                        <p className="font-semibold text-white">{user?.name || 'Admin User'}</p>
                                        <p className="text-sm text-gray-500">{user?.email || 'email@argtravel.id'}</p>
                                        <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-primary-500/20 text-primary-400 rounded-md border border-primary-500/30">
                                            Owner
                                        </span>
                                    </div>
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                navigate('/profile');
                                                setShowUserMenu(false);
                                            }}
                                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-surface-glass hover:text-white transition-colors"
                                        >
                                            <User className="w-4 h-4 mr-3 text-gray-500" />
                                            Profil Saya
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/settings/users');
                                                setShowUserMenu(false);
                                            }}
                                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-surface-glass hover:text-white transition-colors"
                                        >
                                            <Settings className="w-4 h-4 mr-3 text-gray-500" />
                                            Pengaturan
                                        </button>
                                    </div>
                                    <div className="border-t border-surface-border py-2">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 mr-3" />
                                            Keluar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Search Modal */}
            <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
        </>
    );
};

export default TopNavbar;

