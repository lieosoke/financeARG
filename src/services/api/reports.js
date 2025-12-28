/**
 * Report API Service
 */
import { apiClient } from './client';

export const reportService = {
    /**
     * Get audit logs (owner only)
     * @param {Object} params - Query parameters (page, limit, userId, action, entity, startDate, endDate)
     */
    getAuditLogs: (params = {}) => apiClient.get('/laporan/audit', params),

    /**
     * Get audit logs for a specific entity
     * @param {string} entity - Entity type
     * @param {string} entityId - Entity ID
     */
    getEntityAudit: (entity, entityId) =>
        apiClient.get(`/laporan/audit/${entity}/${entityId}`),

    /**
     * Get profit/loss report
     */
    getProfitLoss: () => apiClient.get('/laporan/laba-rugi'),

    /**
     * Get budget vs actual report
     */
    getBudgetActual: () => apiClient.get('/laporan/budget-actual'),
};

export default reportService;
