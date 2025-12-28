/**
 * Format number to Indonesian Rupiah currency
 * @param {number} amount - The amount to format
 * @param {boolean} showCurrency - Whether to show currency symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showCurrency = true) => {
    if (amount === null || amount === undefined) return '-';

    const formatted = new Intl.NumberFormat('id-ID', {
        style: showCurrency ? 'currency' : 'decimal',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

    return formatted;
};

/**
 * Format number with thousand separators
 * @param {number} value - The value to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (value) => {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('id-ID').format(value);
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString) => {
    if (!currencyString) return 0;
    return parseInt(currencyString.replace(/[^0-9]/g, ''), 10) || 0;
};

/**
 * Format percentage
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined) return '0%';
    return `${value.toFixed(decimals)}%`;
};

/**
 * Calculate percentage change
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};
