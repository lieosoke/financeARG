// API Status Constants
export const API_STATUS = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
};

// Package Status
export const PACKAGE_STATUS = {
    OPEN: {
        value: 'open',
        label: 'Terbuka',
        color: 'green',
        icon: '🟢',
    },
    CLOSED: {
        value: 'closed',
        label: 'Ditutup',
        color: 'red',
        icon: '🔴',
    },
    ONGOING: {
        value: 'ongoing',
        label: 'Berlangsung',
        color: 'yellow',
        icon: '🟡',
    },
    COMPLETED: {
        value: 'completed',
        label: 'Selesai',
        color: 'gray',
        icon: '⚫',
    },
};

// Payment Status
export const PAYMENT_STATUS = {
    PENDING: {
        value: 'pending',
        label: 'Belum Bayar',
        color: 'red',
    },
    DP: {
        value: 'dp',
        label: 'DP',
        color: 'yellow',
    },
    CICILAN: {
        value: 'cicilan',
        label: 'Cicilan',
        color: 'orange',
    },
    LUNAS: {
        value: 'lunas',
        label: 'Lunas',
        color: 'green',
    },
    DIBATALKAN: {
        value: 'dibatalkan',
        label: 'Dibatalkan',
        color: 'gray',
    },
};

// Transaction Types
export const TRANSACTION_TYPE = {
    PEMASUKAN: 'pemasukan',
    PENGELUARAN: 'pengeluaran',
};

// Payment Methods
export const PAYMENT_METHOD = {
    BANK_BCA: 'Bank BCA',
    BANK_MANDIRI: 'Bank Mandiri',
    BANK_BNI: 'Bank BNI',
    BANK_BRI: 'Bank BRI',
    BANK_SYARIAH: 'Bank Syariah Indonesia',
    CASH: 'Tunai',
    TRANSFER: 'Transfer',
};

// Expense Categories
export const EXPENSE_CATEGORY = {
    TIKET: 'Tiket Pesawat',
    HOTEL: 'Hotel',
    TRANSPORT: 'Bus & Transport',
    VISA: 'Visa & Handling',
    MUTHAWIF: 'Muthawif',
    KONSUMSI: 'Konsumsi',
    LAINNYA: 'Lain-lain',
};

// Income Categories
export const INCOME_CATEGORY = {
    DP: 'Down Payment',
    CICILAN: 'Cicilan',
    PELUNASAN: 'Pelunasan',
    LAINNYA: 'Lain-lain',
};

// User Roles
export const USER_ROLE = {
    OWNER: {
        value: 'owner',
        label: 'Owner',
        permissions: ['all'],
    },
    FINANCE: {
        value: 'finance',
        label: 'Finance',
        permissions: ['finance', 'reports', 'view_jamaah', 'view_paket'],
    },
    ADMIN: {
        value: 'admin',
        label: 'Admin Operasional',
        permissions: ['jamaah', 'paket', 'view_finance'],
    },
};

// Pagination
export const ITEMS_PER_PAGE = 50;
export const DEFAULT_PAGE = 1;

// Date Formats
export const DATE_FORMAT = {
    DISPLAY: 'dd MMM yyyy',
    TABLE: 'dd/MM/yyyy',
    API: 'yyyy-MM-dd',
    DATETIME: 'dd MMM yyyy HH:mm',
};

// Chart Colors
export const CHART_COLORS = {
    primary: '#059669',
    secondary: '#1e40af',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    gray: '#6b7280',
};

// Dashboard Refresh Interval (milliseconds)
export const REFRESH_INTERVAL = 60000; // 1 minute

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
];
