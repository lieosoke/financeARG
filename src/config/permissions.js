/**
 * Permissions Configuration
 * Defines role-based access control for the application
 */

// Available roles in the system (matching database enum)
export const ROLES = {
    OWNER: 'owner',
    FINANCE: 'finance',
    ADMIN: 'admin',
    USER: 'user',
};

// Permission matrix per role
export const rolePermissions = {
    owner: [
        'dashboard',
        'jamaah:view', 'jamaah:create', 'jamaah:edit', 'jamaah:delete',
        'paket:view', 'paket:create', 'paket:edit', 'paket:delete',
        'keuangan:view', 'keuangan:create', 'keuangan:delete',
        'laporan:view', 'laporan:export',
        'settings:users', 'settings:roles',
    ],
    finance: [
        'dashboard',
        'jamaah:view',
        'paket:view',
        'keuangan:view', 'keuangan:create', 'keuangan:delete',
        'laporan:view', 'laporan:export',
    ],
    admin: [
        'dashboard',
        'jamaah:view', 'jamaah:create', 'jamaah:edit', 'jamaah:delete',
        'paket:view', 'paket:create', 'paket:edit', 'paket:delete',
        'keuangan:view',
        'laporan:view',
    ],
    user: [
        'dashboard',
        'jamaah:view',
        'paket:view',
        'laporan:view',
    ],
};

// Menu access configuration per role
export const menuAccess = {
    owner: ['dashboard', 'jamaah', 'paket', 'keuangan', 'vendor', 'laporan', 'settings'],
    finance: ['dashboard', 'jamaah', 'paket', 'keuangan', 'vendor', 'laporan'],
    admin: ['dashboard', 'jamaah', 'paket', 'keuangan', 'laporan'],
    user: ['dashboard', 'jamaah', 'paket', 'laporan'],
};

// Role display configuration
export const roleConfig = {
    owner: { label: 'Owner', variant: 'primary', description: 'Full access to all features' },
    finance: { label: 'Finance', variant: 'warning', description: 'Manage financial transactions and reports' },
    admin: { label: 'Admin', variant: 'info', description: 'Manage users, packages, and jamaah' },
    user: { label: 'User', variant: 'neutral', description: 'View-only access to basic features' },
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
    if (!role || !permission) return false;
    const permissions = rolePermissions[role] || [];

    // Check for exact match
    if (permissions.includes(permission)) return true;

    // Check for wildcard (e.g., 'keuangan:*' matches 'keuangan:view')
    const [category] = permission.split(':');
    if (permissions.includes(`${category}:*`)) return true;

    // Owner has all permissions
    if (role === 'owner') return true;

    return false;
};

/**
 * Check if a role can access a menu
 * @param {string} role - User role
 * @param {string} menuId - Menu identifier
 * @returns {boolean}
 */
export const canAccessMenu = (role, menuId) => {
    if (!role || !menuId) return false;
    const menus = menuAccess[role] || [];
    return menus.includes(menuId);
};

/**
 * Get role configuration
 * @param {string} role - User role
 * @returns {Object}
 */
export const getRoleConfig = (role) => {
    return roleConfig[role] || roleConfig.admin;
};

export default {
    ROLES,
    rolePermissions,
    menuAccess,
    roleConfig,
    hasPermission,
    canAccessMenu,
    getRoleConfig,
};
