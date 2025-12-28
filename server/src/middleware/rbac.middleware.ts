import { Request, Response, NextFunction } from 'express';

type Role = 'owner' | 'finance' | 'admin' | 'user';

// Role hierarchy: owner > finance > admin > user
const roleHierarchy: Record<Role, number> = {
    owner: 3,
    finance: 2,
    admin: 1,
    user: 0,
};

/**
 * Check if user has required role
 */
const hasRole = (userRole: string, requiredRole: Role): boolean => {
    const userLevel = roleHierarchy[userRole as Role] || 0;
    const requiredLevel = roleHierarchy[requiredRole];
    return userLevel >= requiredLevel;
};

/**
 * Role-based access control middleware factory
 * @param allowedRoles - Array of roles allowed to access the route
 */
export const requireRole = (...allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }

        const userRole = req.user.role as Role;

        // Check if user's role is in allowed roles or has higher privilege
        const hasAccess = allowedRoles.some((role) => hasRole(userRole, role));

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
            });
        }

        next();
    };
};

/**
 * Shorthand middleware for owner-only routes
 */
export const ownerOnly = requireRole('owner');

/**
 * Shorthand middleware for finance and owner routes
 */
export const financeAccess = requireRole('finance', 'owner');

/**
 * Shorthand middleware for any authenticated user
 */
export const anyRole = requireRole('admin', 'finance', 'owner');
