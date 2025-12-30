import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(statusCode: number, message: string, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Maintains proper stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Not found error handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
};

/**
 * Global error handler
 */
export const errorHandler = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', err);

    // Default error values
    let statusCode = 500;
    let message = 'Internal Server Error';
    let error = 'Server Error';

    // Handle ApiError
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        error = statusCode < 500 ? 'Client Error' : 'Server Error';
    }
    // Handle standard Error objects with custom messages (like validation errors from services)
    else if (err instanceof Error && err.message) {
        // If the error message is user-friendly, use it
        const userFriendlyPatterns = [
            /sudah terdaftar/i,
            /tidak ditemukan/i,
            /tidak valid/i,
            /gagal/i,
            /duplikat/i,
        ];

        const isUserFriendly = userFriendlyPatterns.some(pattern => pattern.test(err.message));

        if (isUserFriendly) {
            statusCode = 400;
            error = 'Validation Error';
            message = err.message;
        }
    }

    // Handle known error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        error = 'Validation Error';
        message = err.message;
    }

    if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        error = 'Unauthorized';
        message = 'Invalid authentication';
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        error,
        message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
        }),
    });
};

/**
 * Async handler wrapper to catch async errors
 */
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
