import { Router } from 'express';
import { auditService } from '../services/audit.service';
import { reportService } from '../services/report.service';
import { asyncHandler } from '../middleware/error.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { ownerOnly, financeAccess } from '../middleware/rbac.middleware';

const router = Router();

// All report routes require authentication
router.use(authMiddleware);

/**
 * GET /laporan/audit
 * Get audit logs (owner only)
 */
router.get(
    '/audit',
    ownerOnly,
    asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const { userId, action, entity, startDate, endDate } = req.query as any;

        const result = await auditService.getAll(
            {
                userId,
                action,
                entity,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            },
            { page, limit }
        );

        res.json({
            success: true,
            ...result,
        });
    })
);

/**
 * GET /laporan/audit/:entity/:entityId
 * Get audit logs for a specific entity
 */
router.get(
    '/audit/:entity/:entityId',
    ownerOnly,
    asyncHandler(async (req, res) => {
        const { entity, entityId } = req.params;

        const logs = await auditService.getByEntity(entity, entityId);

        res.json({
            success: true,
            data: logs,
        });
    })
);

/**
 * GET /laporan/laba-rugi
 * Get profit/loss report per package
 */
router.get(
    '/laba-rugi',
    financeAccess,
    asyncHandler(async (req, res) => {
        const { startDate, endDate, packageId } = req.query as any;

        const result = await reportService.getProfitLoss({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            packageId,
        });

        res.json({
            success: true,
            data: result.data,
            summary: result.summary,
        });
    })
);

/**
 * GET /laporan/budget-actual
 * Get budget vs actual report per package
 */
router.get(
    '/budget-actual',
    financeAccess,
    asyncHandler(async (req, res) => {
        const { packageId, status } = req.query as any;

        const result = await reportService.getBudgetActual({
            packageId,
            status,
        });

        res.json({
            success: true,
            data: result.data,
            summary: result.summary,
        });
    })
);

export default router;
