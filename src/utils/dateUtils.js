/**
 * Date utility functions for Indonesian date format (DD/MM/YYYY)
 */

/**
 * Format date to Indonesian display format (DD/MM/YYYY)
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date string
 */
export function formatDateToID(date) {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}

/**
 * Parse Indonesian date format (DD/MM/YYYY) to Date object
 * @param {string} dateString - Date string in DD/MM/YYYY format
 * @returns {Date|null} Date object or null if invalid
 */
export function parseDateFromID(dateString) {
    if (!dateString) return null;

    const parts = dateString.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);

    // Validate the date
    if (
        isNaN(date.getTime()) ||
        date.getDate() !== day ||
        date.getMonth() !== month ||
        date.getFullYear() !== year
    ) {
        return null;
    }

    return date;
}

/**
 * Format date for API calls (YYYY-MM-DD)
 * @param {Date|string} date - Date object or DD/MM/YYYY string
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export function formatDateForAPI(date) {
    if (!date) return '';

    let d;
    if (typeof date === 'string') {
        // Try to parse as DD/MM/YYYY first
        d = parseDateFromID(date);
        if (!d) {
            // Try as ISO string
            d = new Date(date);
        }
    } else {
        d = date;
    }

    if (!d || isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Format date for HTML input (YYYY-MM-DD)
 * @param {Date|string} date - Date object or DD/MM/YYYY string
 * @returns {string} Date string for HTML input
 */
export function formatDateForInput(date) {
    return formatDateForAPI(date);
}

/**
 * Get current date in Indonesian format
 * @returns {string} Current date in DD/MM/YYYY format
 */
export function getCurrentDateID() {
    return formatDateToID(new Date());
}

/**
 * Calculate age from birthdate
 * @param {Date|string} birthDate - Birth date (Date object or DD/MM/YYYY string)
 * @returns {number} Age in years
 */
export function calculateAge(birthDate) {
    if (!birthDate) return 0;

    let birth;
    if (typeof birthDate === 'string') {
        birth = parseDateFromID(birthDate);
        if (!birth) {
            birth = new Date(birthDate);
        }
    } else {
        birth = birthDate;
    }

    if (!birth || isNaN(birth.getTime())) return 0;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

/**
 * Validate Indonesian date format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid DD/MM/YYYY format
 */
export function isValidIDDate(dateString) {
    if (!dateString) return false;

    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateString)) return false;

    const date = parseDateFromID(dateString);
    return date !== null;
}
