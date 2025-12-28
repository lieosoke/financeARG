/**
 * Dashboard API Service
 */
import { apiClient } from './client';

export const dashboardService = {
    /**
     * Get complete dashboard overview
     */
    getOverview: () => apiClient.get('/dashboard/overview'),

    /**
     * Get main dashboard metrics
     */
    getMetrics: () => apiClient.get('/dashboard/metrics'),

    /**
     * Get cashflow chart data
     * @param {number} months - Number of months to fetch (default: 6)
     */
    getCashflow: (months = 6) => apiClient.get('/dashboard/cashflow', { months }),

    /**
     * Get manifest/seat distribution status
     */
    getManifestStatus: () => apiClient.get('/dashboard/manifest-status'),

    /**
     * Get recent transactions
     * @param {number} limit - Number of transactions to fetch (default: 10)
     */
    getRecentTransactions: (limit = 10) =>
        apiClient.get('/dashboard/recent-transactions', { limit }),

    /**
     * Get jamaah payment status summary
     */
    getPaymentStatus: () => apiClient.get('/dashboard/payment-status'),
};

export default dashboardService;
