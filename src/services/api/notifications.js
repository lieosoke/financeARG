/**
 * Notifications API Service
 */
import { apiClient } from './client';

export const notificationService = {
    /**
     * Get all notifications
     * @param {Object} params - Query parameters (page, limit, isRead)
     */
    getAll: (params = {}) => apiClient.get('/notifications', params),

    /**
     * Mark notification as read
     * @param {string} id - Notification ID
     */
    markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),

    /**
     * Mark all notifications as read
     */
    markAllAsRead: () => apiClient.put('/notifications/read-all'),

    /**
     * Delete notification
     * @param {string} id - Notification ID
     */
    delete: (id) => apiClient.delete(`/notifications/${id}`),
};

export default notificationService;
