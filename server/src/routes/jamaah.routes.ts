import { Router } from 'express';
import { z } from 'zod';
import { jamaahService } from '../services/jamaah.service';
import { asyncHandler, ApiError } from '../middleware/error.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';

const router = Router();

// All jamaah routes require authentication
router.use(authMiddleware);

// Validation schemas
const createJamaahSchema = z.object({
    title: z.enum(['Mr', 'Mstr', 'Mrs', 'Miss', 'Infant']).optional(),
    name: z.string().min(1, 'Name is required'),
    nik: z.string().optional(),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
    passportNumber: z.string().optional(),
    passportExpiry: z.string().optional().nullable().transform(val => {
        if (!val || val === '') return null;
        const date = new Date(val);
        if (isNaN(date.getTime())) return null;
        return val;
    }),
    gender: z.enum(['male', 'female']).optional(),
    dateOfBirth: z.string().optional().nullable().transform(val => {
        if (!val || val === '') return null;
        const date = new Date(val);
        if (isNaN(date.getTime())) return null;
        return val;
    }),
    placeOfBirth: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    emergencyContactRelation: z.string().optional(),
    packageId: z.string().optional(),
    seatNumber: z.number().int().positive().optional(),
    totalAmount: z.string().or(z.number()).transform(String),
    paidAmount: z.string().or(z.number()).transform(String).optional(),
    roomType: z.enum(['single', 'double', 'triple', 'quad', 'queen']).optional().nullable(),
    roomNumber: z.string().optional().nullable(),
    roomMate: z.string().optional().nullable(),
    notes: z.string().optional(),
});

const updateJamaahSchema = createJamaahSchema.partial();

const querySchema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(50),
    packageId: z.string().optional(),
    paymentStatus: z.string().optional(),
    isActive: z.string().transform((val) => val === 'true').optional(),
    search: z.string().optional(),
});

/**
 * GET /jamaah
 * Get all jamaah with filters and pagination
 */
router.get(
    '/',
    validateQuery(querySchema),
    asyncHandler(async (req, res) => {
        const { page, limit, packageId, paymentStatus, isActive, search } = req.query as any;

        const result = await jamaahService.getAll(
            { packageId, paymentStatus, isActive, search },
            { page, limit }
        );

        res.json({
            success: true,
            ...result,
        });
    })
);

/**
 * GET /jamaah/unpaid
 * Get jamaah with outstanding balance
 */
router.get(
    '/unpaid',
    asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;

        const result = await jamaahService.getWithOutstandingBalance({ page, limit });

        res.json({
            success: true,
            ...result,
        });
    })
);

/**
 * GET /jamaah/stats
 * Get jamaah statistics
 */
router.get(
    '/stats',
    asyncHandler(async (req, res) => {
        const [countByStatus, totalPiutang, activeCount] = await Promise.all([
            jamaahService.getCountByStatus(),
            jamaahService.getTotalPiutang(),
            jamaahService.getActiveCount(),
        ]);

        res.json({
            success: true,
            data: {
                countByStatus,
                totalPiutang,
                activeCount,
            },
        });
    })
);

/**
 * GET /jamaah/:id
 * Get jamaah by ID with package info
 */
router.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const jamaah = await jamaahService.getByIdWithPackage(req.params.id);

        if (!jamaah) {
            throw new ApiError(404, 'Jamaah not found');
        }

        res.json({
            success: true,
            data: jamaah,
        });
    })
);

/**
 * POST /jamaah
 * Create a new jamaah
 */
router.post(
    '/',
    requireRole('admin', 'owner'),
    validateBody(createJamaahSchema),
    asyncHandler(async (req, res) => {
        const newJamaah = await jamaahService.create(req.body, req.user!.id);

        res.status(201).json({
            success: true,
            message: 'Jamaah created successfully',
            data: newJamaah,
        });
    })
);

/**
 * PUT /jamaah/bulk-update
 * Bulk update jamaah (MUST be defined before /:id route)
 */
const bulkUpdateSchema = z.object({
    updates: z.array(z.object({
        id: z.string(),
        data: updateJamaahSchema
    }))
});

router.put(
    '/bulk-update',
    requireRole('admin', 'owner'),
    validateBody(bulkUpdateSchema),
    asyncHandler(async (req, res) => {
        const success = await jamaahService.bulkUpdate(req.body.updates, req.user!.id);

        if (!success) {
            throw new ApiError(500, 'Failed to perform bulk update');
        }

        res.json({
            success: true,
            message: 'Jamaah bulk updated successfully',
        });
    })
);

/**
 * PUT /jamaah/:id
 * Update a jamaah
 */
router.put(
    '/:id',
    requireRole('admin', 'owner'),
    validateBody(updateJamaahSchema),
    asyncHandler(async (req, res) => {
        const updated = await jamaahService.update(req.params.id, req.body, req.user!.id);

        if (!updated) {
            throw new ApiError(404, 'Jamaah not found');
        }

        res.json({
            success: true,
            message: 'Jamaah updated successfully',
            data: updated,
        });
    })
);

/**
 * DELETE /jamaah/:id
 * Soft delete a jamaah
 */
router.delete(
    '/:id',
    requireRole('owner'),
    asyncHandler(async (req, res) => {
        const deleted = await jamaahService.delete(req.params.id, req.user!.id);

        if (!deleted) {
            throw new ApiError(404, 'Jamaah not found');
        }

        res.json({
            success: true,
            message: 'Jamaah deleted successfully',
        });
    })
);

export default router;
