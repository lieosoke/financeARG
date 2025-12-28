/**
 * Jamaah API Service
 */
import { apiClient } from './client';

export const jamaahService = {
    /**
     * Get all jamaah with filters and pagination
     * @param {Object} params - Query parameters (page, limit, packageId, paymentStatus, isActive, search)
     */
    getAll: (params = {}) => apiClient.get('/jamaah', params),

    /**
     * Get jamaah with outstanding balance
     * @param {Object} params - Query parameters (page, limit)
     */
    getUnpaid: (params = {}) => apiClient.get('/jamaah/unpaid', params),

    /**
     * Get jamaah statistics
     */
    getStats: () => apiClient.get('/jamaah/stats'),

    /**
     * Get jamaah by ID with package info
     * @param {string} id - Jamaah ID
     */
    getById: (id) => apiClient.get(`/jamaah/${id}`),

    /**
     * Create a new jamaah
     * @param {Object} data - Jamaah data
     */
    create: (data) => apiClient.post('/jamaah', data),

    /**
     * Update a jamaah
     * @param {string} id - Jamaah ID
     * @param {Object} data - Updated jamaah data
     */
    update: (id, data) => apiClient.put(`/jamaah/${id}`, data),

    /**
     * Soft delete a jamaah
     * @param {string} id - Jamaah ID
     */
    remove: (id) => apiClient.delete(`/jamaah/${id}`),

    /**
     * Bulk update jamaah
     * @param {Array} updates - Array of update objects { id, data }
     */
    bulkUpdate: (updates) => apiClient.put('/jamaah/bulk-update', { updates }),
};

export default jamaahService;
