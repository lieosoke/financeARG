import { format, formatDistance, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format date to Indonesian format
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string (default: 'dd MMM yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: id });
};

/**
 * Format date with time
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date time string
 */
export const formatDateTime = (date) => {
    return formatDate(date, 'dd MMM yyyy HH:mm');
};

/**
 * Format date for display in tables
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatTableDate = (date) => {
    return formatDate(date, 'dd/MM/yyyy');
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true, locale: id });
};

/**
 * Format date for API calls (ISO format)
 * @param {Date} date - Date to format
 * @returns {string} ISO formatted date string
 */
export const formatAPIDate = (date) => {
    if (!date) return null;
    return format(date, 'yyyy-MM-dd');
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
    if (!date) return false;
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj < new Date();
};

/**
 * Get days until a date
 * @param {Date|string} date - Target date
 * @returns {number} Number of days until the date
 */
export const daysUntil = (date) => {
    if (!date) return 0;
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    const diffTime = dateObj - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};
