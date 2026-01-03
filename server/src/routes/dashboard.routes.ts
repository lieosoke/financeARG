import { Router } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { asyncHandler } from '../middleware/error.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { dashboardAccess } from '../middleware/rbac.middleware';

const router = Router();

// All dashboard routes require authentication and admin/finance/owner role
router.use(authMiddleware);
router.use(dashboardAccess);

/**
 * GET /dashboard/overview
 * Get complete dashboard overview
 */
router.get(
    '/overview',
    asyncHandler(async (req, res) => {
        const overview = await dashboardService.getOverview();

        res.json({
            success: true,
            data: overview,
        });
    })
);

/**
 * GET /dashboard/metrics
 * Get main dashboard metrics
 */
router.get(
    '/metrics',
    asyncHandler(async (req, res) => {
        const metrics = await dashboardService.getMetrics();

        res.json({
            success: true,
            data: metrics,
        });
    })
);

/**
 * GET /dashboard/cashflow
 * Get cashflow chart data
 */
router.get(
    '/cashflow',
    asyncHandler(async (req, res) => {
        const months = parseInt(req.query.months as string) || 6;
        const cashflow = await dashboardService.getCashflowChart(months);

        res.json({
            success: true,
            data: cashflow,
        });
    })
);

/**
 * GET /dashboard/manifest-status
 * Get manifest/seat distribution status
 */
router.get(
    '/manifest-status',
    asyncHandler(async (req, res) => {
        const manifestStatus = await dashboardService.getManifestStatus();

        res.json({
            success: true,
            data: manifestStatus,
        });
    })
);

/**
 * GET /dashboard/recent-transactions
 * Get recent transactions
 */
router.get(
    '/recent-transactions',
    asyncHandler(async (req, res) => {
        const limit = parseInt(req.query.limit as string) || 10;
        const transactions = await dashboardService.getRecentTransactions(limit);

        res.json({
            success: true,
            data: transactions,
        });
    })
);

/**
 * GET /dashboard/payment-status
 * Get jamaah payment status summary
 */
router.get(
    '/payment-status',
    asyncHandler(async (req, res) => {
        const paymentStatus = await dashboardService.getPaymentStatusSummary();

        res.json({
            success: true,
            data: paymentStatus,
        });
    })
);

export default router;
