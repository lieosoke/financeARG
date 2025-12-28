import { Router } from 'express';
import { z } from 'zod';
import { vendorService, vendorDebtService } from '../services/vendor.service';
import { asyncHandler, ApiError } from '../middleware/error.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { financeAccess, ownerOnly, requireRole } from '../middleware/rbac.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';

const router = Router();

// All vendor routes require authentication
router.use(authMiddleware);

// Validation schemas
const createVendorSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.string().min(1, 'Type is required'),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    bankAccount: z.string().optional(),
    bankName: z.string().optional(),
    bankAccountHolder: z.string().optional(),
    npwp: z.string().optional(),
    notes: z.string().optional(),
});

const updateVendorSchema = createVendorSchema.partial();

const createDebtSchema = z.object({
    vendorId: z.string().min(1, 'Vendor ID is required'),
    packageId: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
    totalAmount: z.string().or(z.number()).transform(String),
    paidAmount: z.string().or(z.number()).transform(String).optional(),
    dueDate: z.string().optional().nullable().transform(val => {
        if (!val || val === '') return null;
        const date = new Date(val);
        if (isNaN(date.getTime())) return null;
        return val;
    }),
    notes: z.string().optional(),
});

const updateDebtSchema = createDebtSchema.partial();

const querySchema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(50),
    type: z.string().optional(),
    isActive: z.string().transform((val) => val === 'true').optional(),
    search: z.string().optional(),
});

// ===== VENDOR ROUTES =====

/**
 * GET /vendor
 * Get all vendors
 */
router.get(
    '/',
    validateQuery(querySchema),
    asyncHandler(async (req, res) => {
        const { page, limit, type, isActive, search } = req.query as any;

        const result = await vendorService.getAll(
            { type, isActive, search },
            { page, limit }
        );

        res.json({
            success: true,
            ...result,
        });
    })
);

/**
 * POST /vendor
 * Create a new vendor
 */
router.post(
    '/',
    requireRole('admin', 'owner'),
    validateBody(createVendorSchema),
    asyncHandler(async (req, res) => {
        const vendor = await vendorService.create(req.body, req.user!.id);

        res.status(201).json({
            success: true,
            message: 'Vendor created successfully',
            data: vendor,
        });
    })
);

/**
 * PUT /vendor/:id
 * Update a vendor
 */
router.put(
    '/:id',
    requireRole('admin', 'owner'),
    validateBody(updateVendorSchema),
    asyncHandler(async (req, res) => {
        const updated = await vendorService.update(req.params.id, req.body, req.user!.id);

        if (!updated) {
            throw new ApiError(404, 'Vendor not found');
        }

        res.json({
            success: true,
            message: 'Vendor updated successfully',
            data: updated,
        });
    })
);

/**
 * DELETE /vendor/:id
 * Delete a vendor (soft delete)
 */
router.delete(
    '/:id',
    requireRole('owner'),
    asyncHandler(async (req, res) => {
        const deleted = await vendorService.delete(req.params.id, req.user!.id);

        if (!deleted) {
            throw new ApiError(404, 'Vendor not found');
        }

        res.json({
            success: true,
            message: 'Vendor deleted successfully',
        });
    })
);

// ===== VENDOR DEBT ROUTES (under /vendor/hutang) =====

/**
 * GET /vendor/hutang
 * Get all vendor debts
 */
router.get(
    '/hutang',
    financeAccess,
    asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const { vendorId, packageId, status } = req.query as any;

        const result = await vendorDebtService.getAll(
            { vendorId, packageId, status },
            { page, limit }
        );

        res.json({
            success: true,
            ...result,
        });
    })
);

/**
 * GET /vendor/hutang/total
 * Get total outstanding debts
 */
router.get(
    '/hutang/total',
    financeAccess,
    asyncHandler(async (req, res) => {
        const total = await vendorDebtService.getTotalOutstanding();

        res.json({
            success: true,
            data: { totalOutstanding: total },
        });
    })
);

/**
 * GET /vendor/hutang/:id
 * Get vendor debt by ID
 */
router.get(
    '/hutang/:id',
    financeAccess,
    asyncHandler(async (req, res) => {
        const debt = await vendorDebtService.getById(req.params.id);

        if (!debt) {
            throw new ApiError(404, 'Vendor debt not found');
        }

        res.json({
            success: true,
            data: debt,
        });
    })
);

/**
 * POST /vendor/hutang
 * Create a vendor debt
 */
router.post(
    '/hutang',
    financeAccess,
    validateBody(createDebtSchema),
    asyncHandler(async (req, res) => {
        const debt = await vendorDebtService.create(req.body, req.user!.id);

        res.status(201).json({
            success: true,
            message: 'Vendor debt created successfully',
            data: debt,
        });
    })
);

/**
 * PUT /vendor/hutang/:id
 * Update a vendor debt
 */
router.put(
    '/hutang/:id',
    financeAccess,
    validateBody(updateDebtSchema),
    asyncHandler(async (req, res) => {
        const updated = await vendorDebtService.update(req.params.id, req.body, req.user!.id);

        if (!updated) {
            throw new ApiError(404, 'Vendor debt not found');
        }

        res.json({
            success: true,
            message: 'Vendor debt updated successfully',
            data: updated,
        });
    })
);

/**
 * POST /vendor/hutang/:id/pay
 * Add payment to vendor debt
 */
router.post(
    '/hutang/:id/pay',
    financeAccess,
    validateBody(z.object({ amount: z.number().positive() })),
    asyncHandler(async (req, res) => {
        const updated = await vendorDebtService.addPayment(
            req.params.id,
            req.body.amount,
            req.user!.id
        );

        if (!updated) {
            throw new ApiError(404, 'Vendor debt not found');
        }

        res.json({
            success: true,
            message: 'Payment added successfully',
            data: updated,
        });
    })
);

/**
 * DELETE /vendor/hutang/:id
 * Delete a vendor debt
 */
router.delete(
    '/hutang/:id',
    ownerOnly,
    asyncHandler(async (req, res) => {
        const deleted = await vendorDebtService.delete(req.params.id, req.user!.id);

        if (!deleted) {
            throw new ApiError(404, 'Vendor debt not found');
        }

        res.json({
            success: true,
            message: 'Vendor debt deleted successfully',
        });
    })
);

/**
 * GET /vendor/:id
 * Get vendor by ID
 */
router.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const vendor = await vendorService.getById(req.params.id);

        if (!vendor) {
            throw new ApiError(404, 'Vendor not found');
        }

        res.json({
            success: true,
            data: vendor,
        });
    })
);

export default router;
