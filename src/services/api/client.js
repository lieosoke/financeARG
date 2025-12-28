/**
 * Base API Client
 * Provides fetch wrapper with common configuration for all API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

/**
 * Make an API request with common configuration
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} Response data
 */
async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include', // Required for Better Auth cookie-based sessions
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || 'Request failed');
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

/**
 * API Client with HTTP method helpers
 */
export const apiClient = {
    /**
     * GET request
     * @param {string} endpoint 
     * @param {Object} params - Query parameters
     */
    get: (endpoint, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return request(url, { method: 'GET' });
    },

    /**
     * POST request
     * @param {string} endpoint 
     * @param {Object} data - Request body
     */
    post: (endpoint, data = {}) => {
        return request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * PUT request
     * @param {string} endpoint 
     * @param {Object} data - Request body
     */
    put: (endpoint, data = {}) => {
        return request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * DELETE request
     * @param {string} endpoint 
     */
    delete: (endpoint) => {
        return request(endpoint, { method: 'DELETE' });
    },
};

export default apiClient;
