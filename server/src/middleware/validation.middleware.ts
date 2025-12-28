import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation middleware factory
 * @param schema - Zod schema to validate against
 * @param source - Where to get data from (body, query, params)
 */
export const validate = (
    schema: ZodSchema,
    source: 'body' | 'query' | 'params' = 'body'
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req[source];
            const validated = schema.parse(data);


            // const data = req[source]; // Removed duplicate
            // const validated = schema.parse(data); // Removed duplicate

            if (source === 'body') {
                req.body = validated;
            } else if (source === 'query') {
                // req.query is often a getter or readonly in some environments/middlewares
                Object.assign(req.query, validated);
            } else if (source === 'params') {
                Object.assign(req.params, validated);
            }
            next();

        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Invalid request data',
                    details: error.issues.map((err) => ({
                        field: String(err.path.join('.')),
                        message: String(err.message),
                    })),
                });
            }
            next(error);
        }
    };
};

/**
 * Validate request body
 */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');

/**
 * Validate query parameters
 */
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');

/**
 * Validate route parameters
 */
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
