import { Router } from 'express';
import { z } from 'zod';
import { packageService } from '../services/package.service';
import { asyncHandler, ApiError } from '../middleware/error.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';

const router = Router();

// All package routes require authentication
router.use(authMiddleware);

// Validation schemas
const createPackageSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    name: z.string().min(1, 'Name is required'),
    type: z.enum(['umroh', 'haji']),
    description: z.string().optional().nullable(),
    pricePerPerson: z.string().or(z.number()).transform(String),
    totalSeats: z.number().int().positive(),
    departureDate: z.string().optional().nullable().transform(val => {
        if (!val || val === '') return null;
        // Validate it's a valid date
        const date = new Date(val);
        if (isNaN(date.getTime())) return null;
        return val;
    }),
    returnDate: z.string().optional().nullable().transform(val => {
        if (!val || val === '') return null;
        // Validate it's a valid date
        const date = new Date(val);
        if (isNaN(date.getTime())) return null;
        return val;
    }),
    status: z.enum(['open', 'closed', 'ongoing', 'completed']).optional(),
    estimatedCost: z.string().or(z.number()).transform(String).optional().nullable(),
    hotelMakkah: z.string().optional().nullable(),
    hotelMadinah: z.string().optional().nullable(),
    airline: z.string().optional().nullable(),
});

const updatePackageSchema = createPackageSchema.partial();

const querySchema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(50),
    status: z.string().optional(),
    type: z.string().optional(),
    search: z.string().optional(),
});

/**
 * GET /paket
 * Get all packages with filters and pagination
 */
router.get(
    '/',
    validateQuery(querySchema),
    asyncHandler(async (req, res) => {
        const { page, limit, status, type, search } = req.query as any;

        const result = await packageService.getAll(
            { status, type, search },
            { page, limit }
        );

        res.json({
            success: true,
            ...result,
        });
    })
);

/**
 * GET /paket/:id
 * Get package by ID
 */
router.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const pkg = await packageService.getById(req.params.id);

        if (!pkg) {
            throw new ApiError(404, 'Package not found');
        }

        res.json({
            success: true,
            data: pkg,
        });
    })
);

/**
 * GET /paket/:id/summary
 * Get package summary with occupancy info
 */
router.get(
    '/:id/summary',
    asyncHandler(async (req, res) => {
        const summary = await packageService.getSummary(req.params.id);

        if (!summary) {
            throw new ApiError(404, 'Package not found');
        }

        res.json({
            success: true,
            data: summary,
        });
    })
);

/**
 * POST /paket
 * Create a new package
 */
router.post(
    '/',
    requireRole('admin', 'owner'),
    validateBody(createPackageSchema),
    asyncHandler(async (req, res) => {
        // Check for duplicate code
        const existing = await packageService.getByCode(req.body.code);
        if (existing) {
            throw new ApiError(400, 'Package with this code already exists');
        }

        const newPackage = await packageService.create(req.body, req.user!.id);

        res.status(201).json({
            success: true,
            message: 'Package created successfully',
            data: newPackage,
        });
    })
);

/**
 * PUT /paket/:id
 * Update a package
 */
router.put(
    '/:id',
    requireRole('admin', 'owner'),
    validateBody(updatePackageSchema),
    asyncHandler(async (req, res) => {
        // Check for duplicate code if code is being changed
        if (req.body.code) {
            const existing = await packageService.getByCode(req.body.code);
            if (existing && existing.id !== req.params.id) {
                throw new ApiError(400, 'Package with this code already exists');
            }
        }

        const updated = await packageService.update(req.params.id, req.body, req.user!.id);

        if (!updated) {
            throw new ApiError(404, 'Package not found');
        }

        res.json({
            success: true,
            message: 'Package updated successfully',
            data: updated,
        });
    })
);

/**
 * DELETE /paket/:id
 * Delete a package
 */
router.delete(
    '/:id',
    requireRole('owner'),
    asyncHandler(async (req, res) => {
        const deleted = await packageService.delete(req.params.id, req.user!.id);

        if (!deleted) {
            throw new ApiError(404, 'Package not found');
        }

        res.json({
            success: true,
            message: 'Package deleted successfully',
        });
    })
);

export default router;
