/**
 * Notifications Hook
 * Custom hook for fetching and managing notifications
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/api/notifications';

/**
 * Hook to fetch notifications
 * @param {Object} options - Query options
 * @returns {Object} Query result with notifications data
 */
export const useNotifications = (options = {}) => {
    const { limit = 10, isRead } = options;

    return useQuery({
        queryKey: ['notifications', { limit, isRead }],
        queryFn: () => notificationService.getAll({ limit, isRead }),
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 10000, // Consider data stale after 10 seconds
    });
};

/**
 * Hook to mark notification as read
 * @returns {Object} Mutation result
 */
export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

/**
 * Hook to mark all notifications as read
 * @returns {Object} Mutation result
 */
export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

/**
 * Hook to delete notification
 * @returns {Object} Mutation result
 */
export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => notificationService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export default useNotifications;
