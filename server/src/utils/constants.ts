// API Status Constants
export const API_STATUS = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
} as const;

// Package Status
export const PACKAGE_STATUS = {
    OPEN: 'open',
    CLOSED: 'closed',
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    DP: 'dp',
    CICILAN: 'cicilan',
    LUNAS: 'lunas',
    DIBATALKAN: 'dibatalkan',
} as const;

// Transaction Types
export const TRANSACTION_TYPE = {
    PEMASUKAN: 'pemasukan',
    PENGELUARAN: 'pengeluaran',
} as const;

// Payment Methods
export const PAYMENT_METHOD = {
    BANK_BCA: 'bank_bca',
    BANK_MANDIRI: 'bank_mandiri',
    BANK_BNI: 'bank_bni',
    BANK_BRI: 'bank_bri',
    BANK_SYARIAH: 'bank_syariah',
    CASH: 'cash',
    TRANSFER: 'transfer',
} as const;

// Expense Categories
export const EXPENSE_CATEGORY = {
    TIKET_PESAWAT: 'tiket_pesawat',
    HOTEL: 'hotel',
    TRANSPORT: 'transport',
    VISA_HANDLING: 'visa_handling',
    MUTHAWIF: 'muthawif',
    KONSUMSI: 'konsumsi',
    LAINNYA: 'lainnya',
} as const;

// Income Categories
export const INCOME_CATEGORY = {
    DP: 'dp',
    CICILAN: 'cicilan',
    PELUNASAN: 'pelunasan',
    LAINNYA: 'lainnya',
} as const;

// User Roles
export const USER_ROLE = {
    OWNER: 'owner',
    FINANCE: 'finance',
    ADMIN: 'admin',
} as const;

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 100;
