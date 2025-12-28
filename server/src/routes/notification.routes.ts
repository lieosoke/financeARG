import { Router } from 'express';
import { z } from 'zod';
import { notificationService } from '../services/notification.service';
import { asyncHandler, ApiError } from '../middleware/error.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Validation schemas
const querySchema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
    isRead: z.string().transform((val) => val === 'true').optional(),
});

/**
 * GET /notifications
 * Get user notifications
 */
router.get(
    '/',
    validateQuery(querySchema),
    asyncHandler(async (req, res) => {
        const { page, limit, isRead } = req.query as any;

        const result = await notificationService.getAll(
            req.user!.id,
            { isRead },
            { page, limit }
        );

        res.json({
            success: true,
            ...result,
        });
    })
);

/**
 * PUT /notifications/read-all
 * Mark all as read
 */
router.put(
    '/read-all',
    asyncHandler(async (req, res) => {
        await notificationService.markAllAsRead(req.user!.id);

        res.json({
            success: true,
            message: 'All notifications marked as read',
        });
    })
);

/**
 * PUT /notifications/:id/read
 * Mark as read
 */
router.put(
    '/:id/read',
    asyncHandler(async (req, res) => {
        const updated = await notificationService.markAsRead(req.params.id, req.user!.id);

        if (!updated) {
            throw new ApiError(404, 'Notification not found');
        }

        res.json({
            success: true,
            data: updated,
        });
    })
);

/**
 * DELETE /notifications/:id
 * Delete notification
 */
router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const deleted = await notificationService.delete(req.params.id, req.user!.id);

        if (!deleted) {
            throw new ApiError(404, 'Notification not found');
        }

        res.json({
            success: true,
            message: 'Notification deleted',
        });
    })
);

export default router;
