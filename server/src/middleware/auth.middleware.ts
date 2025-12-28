import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/auth';
import { fromNodeHeaders } from 'better-auth/node';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string | null;
                role: string;
            };
            session?: {
                id: string;
                userId: string;
                expiresAt: Date;
            };
        }
    }
}

/**
 * Authentication middleware
 * Validates the session and attaches user to request
 */
export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });



        if (!session) {


            return res.status(401).json({

                success: false,
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }

        // Attach user and session to request
        req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: (session.user as any).role || 'user',
        };
        req.session = {
            id: session.session.id,
            userId: session.session.userId,
            expiresAt: session.session.expiresAt,
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Invalid or expired session',
        });
    }
};

/**
 * Optional authentication middleware
 * Attaches user to request if authenticated, but doesn't require it
 */
export const optionalAuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (session) {
            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: (session.user as any).role || 'user',
            };
            req.session = {
                id: session.session.id,
                userId: session.session.userId,
                expiresAt: session.session.expiresAt,
            };
        }

        next();
    } catch (error) {
        // Continue without auth
        next();
    }
};
