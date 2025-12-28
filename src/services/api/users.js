/**
 * Users API Service
 * Handles user management API calls
 */
import { apiClient } from './client';

export const usersApi = {
    /**
     * Get all users (owner only)
     */
    getAll: () => apiClient.get('/users'),

    /**
     * Get user by ID
     */
    getById: (id) => apiClient.get(`/users/${id}`),

    /**
     * Create a new user (owner only)
     * @param {Object} data - User data (email, name, password, role)
     */
    create: (data) => apiClient.post('/users', data),

    /**
     * Update user
     */
    update: (id, data) => apiClient.put(`/users/${id}`, data),

    /**
     * Delete user
     */
    delete: (id) => apiClient.delete(`/users/${id}`),

    /**
     * Update password
     * @param {string} id - User ID
     * @param {Object} data - { currentPassword, newPassword }
     */
    updatePassword: (id, data) => apiClient.put(`/users/${id}/password`, data),
};

export default usersApi;
