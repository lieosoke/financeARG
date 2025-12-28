/**
 * Vendor API Service
 */
import { apiClient } from './client';

export const vendorService = {
    /**
     * Get all vendors with filters and pagination
     * @param {Object} params - Query parameters (page, limit, type, isActive, search)
     */
    getAll: (params = {}) => apiClient.get('/vendor', params),

    /**
     * Get vendor by ID
     * @param {string} id - Vendor ID
     */
    getById: (id) => apiClient.get(`/vendor/${id}`),

    /**
     * Create a new vendor
     * @param {Object} data - Vendor data
     */
    create: (data) => apiClient.post('/vendor', data),

    /**
     * Update a vendor
     * @param {string} id - Vendor ID
     * @param {Object} data - Updated vendor data
     */
    update: (id, data) => apiClient.put(`/vendor/${id}`, data),

    /**
     * Delete a vendor (soft delete)
     * @param {string} id - Vendor ID
     */
    remove: (id) => apiClient.delete(`/vendor/${id}`),
};

export const vendorDebtService = {
    /**
     * Get all vendor debts
     * @param {Object} params - Query parameters (page, limit, vendorId, packageId, status)
     */
    getAll: (params = {}) => apiClient.get('/vendor/hutang', params),

    /**
     * Get total outstanding debts
     */
    getTotalOutstanding: () => apiClient.get('/vendor/hutang/total'),

    /**
     * Get vendor debt by ID
     * @param {string} id - Debt ID
     */
    getById: (id) => apiClient.get(`/vendor/hutang/${id}`),

    /**
     * Create a vendor debt
     * @param {Object} data - Debt data
     */
    create: (data) => apiClient.post('/vendor/hutang', data),

    /**
     * Update a vendor debt
     * @param {string} id - Debt ID
     * @param {Object} data - Updated debt data
     */
    update: (id, data) => apiClient.put(`/vendor/hutang/${id}`, data),

    /**
     * Add payment to vendor debt
     * @param {string} id - Debt ID
     * @param {number} amount - Payment amount
     */
    pay: (id, amount) => apiClient.post(`/vendor/hutang/${id}/pay`, { amount }),

    /**
     * Delete a vendor debt
     * @param {string} id - Debt ID
     */
    remove: (id) => apiClient.delete(`/vendor/hutang/${id}`),
};

export default { vendorService, vendorDebtService };
