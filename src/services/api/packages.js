/**
 * Package API Service
 */
import { apiClient } from './client';

export const packageService = {
    /**
     * Get all packages with filters and pagination
     * @param {Object} params - Query parameters (page, limit, status, type, search)
     */
    getAll: (params = {}) => apiClient.get('/paket', params),

    /**
     * Get package by ID
     * @param {string} id - Package ID
     */
    getById: (id) => apiClient.get(`/paket/${id}`),

    /**
     * Get package summary with occupancy info
     * @param {string} id - Package ID
     */
    getSummary: (id) => apiClient.get(`/paket/${id}/summary`),

    /**
     * Create a new package
     * @param {Object} data - Package data
     */
    create: (data) => apiClient.post('/paket', data),

    /**
     * Update a package
     * @param {string} id - Package ID
     * @param {Object} data - Updated package data
     */
    update: (id, data) => apiClient.put(`/paket/${id}`, data),

    /**
     * Delete a package
     * @param {string} id - Package ID
     */
    remove: (id) => apiClient.delete(`/paket/${id}`),
};

export default packageService;
