import React, { useState } from 'react';
import Card from '../../components/molecules/Card';
import { Bell, Check, Trash2, Filter, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/api/notifications';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import Button from '../../components/atoms/Button';

const NotificationsPage = () => {
    const [filter, setFilter] = useState('all');
    const queryClient = useQueryClient();

    // Fetch notifications
    const { data: notificationsData, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['notifications', filter],
        queryFn: () => notificationService.getAll({
            limit: 50,
            isRead: filter === 'unread' ? 'false' : undefined
        }),
        retry: 2,
    });

    const notifications = notificationsData?.data || [];
    const unreadCount = notificationsData?.unreadCount || 0;

    // Mutations
    const markAsReadMutation = useMutation({
        mutationFn: (id) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Semua notifikasi ditandai sudah dibaca');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => notificationService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Notifikasi dihapus');
        },
    });

    const getNotifStyle = (type) => {
        const styles = {
            success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            error: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        };
        return styles[type] || styles.info;
    };

    const getNotifDot = (type) => {
        const colors = {
            success: 'bg-emerald-500',
            warning: 'bg-amber-500',
            info: 'bg-blue-500',
            error: 'bg-rose-500',
        };
        return colors[type] || 'bg-gray-500';
    };

    const handleMarkAsRead = (id, e) => {
        e.stopPropagation();
        markAsReadMutation.mutate(id);
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (window.confirm('Hapus notifikasi ini?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="page-title flex items-center gap-3">
                            <Bell className="w-8 h-8 text-primary-400" />
                            Notifikasi
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Semua notifikasi sistem dan update terbaru
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            className="btn-secondary text-sm"
                            onClick={() => markAllReadMutation.mutate()}
                            disabled={markAllReadMutation.isPending || unreadCount === 0}
                        >
                            <Check className="w-4 h-4" />
                            Tandai Semua Dibaca
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'bg-surface-glass text-gray-400 hover:text-gray-200'
                        }`}
                >
                    Semua
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'unread'
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'bg-surface-glass text-gray-400 hover:text-gray-200'
                        }`}
                >
                    Belum Dibaca {unreadCount > 0 && `(${unreadCount})`}
                </button>
            </div>

            {/* Notifications List */}
            <Card>
                <div className="divide-y divide-surface-border">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                        </div>
                    ) : isError ? (
                        <div className="text-center py-12 px-4">
                            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                            <p className="text-gray-400 mb-4">{error?.message || 'Gagal memuat notifikasi'}</p>
                            <Button size="sm" onClick={() => refetch()} icon={<RefreshCw className="w-4 h-4" />}>
                                Coba Lagi
                            </Button>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500">Tidak ada notifikasi</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-4 hover:bg-surface-glass transition-colors cursor-pointer ${!notif.isRead ? 'bg-primary-500/5' : ''
                                    }`}
                                onClick={() => !notif.isRead && markAsReadMutation.mutate(notif.id)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${getNotifDot(notif.type)} ${!notif.isRead ? 'animate-pulse' : ''}`}></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className={`text-sm ${!notif.isRead ? 'text-white font-medium' : 'text-gray-300'}`}>
                                                {notif.title}
                                            </p>
                                            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: idLocale })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {notif.message}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border ${getNotifStyle(notif.type)}`}>
                                            {notif.type === 'success' ? 'Sukses' : notif.type === 'warning' ? 'Peringatan' : notif.type === 'error' ? 'Error' : 'Info'}
                                        </span>
                                        <button
                                            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                            onClick={(e) => handleDelete(notif.id, e)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};

export default NotificationsPage;
