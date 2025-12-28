/**
 * Company Settings API Service
 */
import { apiClient } from './client';

export const companySettingsService = {
    /**
     * Get company settings
     */
    get: () => apiClient.get('/company'),

    /**
     * Update company settings
     * @param {Object} data - Company settings data
     */
    update: (data) => apiClient.put('/company', data),
};

export default companySettingsService;
