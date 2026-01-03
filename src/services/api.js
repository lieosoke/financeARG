// API Configuration
const hostname = window.location.hostname;
const API_BASE_URL = `http://${hostname}:3001/api/v1`;

/**
 * API Client for ARG Finance Backend
 */
class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    getToken() {
        return this.token;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.message || 'Request failed',
                    error: data.error,
                };
            }

            return data;
        } catch (error) {
            if (error.status) throw error;
            throw {
                status: 0,
                message: 'Network error. Please check your connection.',
                error: 'NetworkError',
            };
        }
    }

    // Auth endpoints
    async login(email, password) {
        const response = await this.request('/auth/sign-in/email', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async signup(email, password, name) {
        const response = await this.request('/auth/sign-up/email', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });
        if (response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async logout() {
        try {
            await this.request('/auth/sign-out', { method: 'POST' });
        } finally {
            this.setToken(null);
        }
    }

    async getSession() {
        return this.request('/auth/session');
    }

    // Dashboard endpoints
    async getDashboardOverview() {
        return this.request('/dashboard/overview');
    }

    async getDashboardMetrics() {
        return this.request('/dashboard/metrics');
    }

    async getCashflow(months = 6) {
        return this.request(`/dashboard/cashflow?months=${months}`);
    }

    async getRecentTransactions(limit = 10) {
        return this.request(`/dashboard/recent-transactions?limit=${limit}`);
    }

    // Package endpoints
    async getPackages(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/paket${query ? `?${query}` : ''}`);
    }

    async getPackage(id) {
        return this.request(`/paket/${id}`);
    }

    async createPackage(data) {
        return this.request('/paket', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updatePackage(id, data) {
        return this.request(`/paket/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Jamaah endpoints
    async getJamaah(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/jamaah${query ? `?${query}` : ''}`);
    }

    async getJamaahById(id) {
        return this.request(`/jamaah/${id}`);
    }

    async createJamaah(data) {
        return this.request('/jamaah', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateJamaah(id, data) {
        return this.request(`/jamaah/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Transaction endpoints
    async getTransactions(type, params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = type === 'income' ? '/keuangan/pemasukan' : '/keuangan/pengeluaran';
        return this.request(`${endpoint}${query ? `?${query}` : ''}`);
    }

    async createIncome(data) {
        return this.request('/keuangan/pemasukan', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async createExpense(data) {
        return this.request('/keuangan/pengeluaran', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Vendor endpoints
    async getVendors(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/vendor${query ? `?${query}` : ''}`);
    }

    async createVendor(data) {
        return this.request('/vendor', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);
export default api;
