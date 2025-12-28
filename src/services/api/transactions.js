/**
 * Transaction API Service
 */
import { apiClient } from './client';

export const transactionService = {
    /**
     * Get cashflow summary by month
     * @param {number} months - Number of months to fetch (default: 6)
     */
    getCashflow: (months = 6) => apiClient.get('/keuangan/cashflow', { months }),

    /**
     * Get total income and expense
     * @param {string} startDate - Start date (ISO string)
     * @param {string} endDate - End date (ISO string)
     */
    getTotals: (startDate, endDate) => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        return apiClient.get('/keuangan/totals', params);
    },

    /**
     * Get all income transactions
     * @param {Object} params - Query parameters (page, limit, packageId, jamaahId, startDate, endDate, incomeCategory)
     */
    getIncome: (params = {}) => apiClient.get('/keuangan/pemasukan', params),

    /**
     * Create income transaction
     * @param {Object} data - Income transaction data
     */
    createIncome: (data) => apiClient.post('/keuangan/pemasukan', data),

    /**
     * Get all expense transactions
     * @param {Object} params - Query parameters (page, limit, packageId, vendorId, startDate, endDate, expenseCategory)
     */
    getExpenses: (params = {}) => apiClient.get('/keuangan/pengeluaran', params),

    /**
     * Create expense transaction
     * @param {Object} data - Expense transaction data
     */
    createExpense: (data) => apiClient.post('/keuangan/pengeluaran', data),

    /**
     * Get transaction by ID
     * @param {string} id - Transaction ID
     */
    getById: (id) => apiClient.get(`/keuangan/${id}`),

    /**
     * Update a transaction
     * @param {string} id - Transaction ID
     * @param {Object} data - Updated transaction data
     */
    update: (id, data) => apiClient.put(`/keuangan/${id}`, data),

    /**
     * Delete a transaction
     * @param {string} id - Transaction ID
     */
    remove: (id) => apiClient.delete(`/keuangan/${id}`),
};

export default transactionService;
