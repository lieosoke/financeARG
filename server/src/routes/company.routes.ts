import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { companySettingsService } from '../services/companySettings.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// Validation schema for company settings
const companySettingsSchema = z.object({
    name: z.string().min(1, 'Company name is required').max(255),
    address: z.string().optional().nullable(),
    city: z.string().max(255).optional().nullable(),
    phone: z.string().max(50).optional().nullable(),
    email: z.string().email().optional().nullable().or(z.literal('')),
    bankAccounts: z.array(z.object({
        bankName: z.string(),
        accountNumber: z.string(),
        accountHolder: z.string(),
    })).optional().nullable(),
});

/**
 * GET /company
 * Get company settings (public - used for invoices and branding)
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const settings = await companySettingsService.get();

        res.json({
            success: true,
            data: settings,
        });
    } catch (error) {
        console.error('Error fetching company settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company settings',
        });
    }
});

/**
 * PUT /company
 * Update company settings (owner only)
 */
router.put(
    '/',
    authMiddleware,
    requireRole('owner'),
    async (req: Request, res: Response) => {
        try {
            const validatedData = companySettingsSchema.parse(req.body);
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            const settings = await companySettingsService.upsert(validatedData, userId);

            res.json({
                success: true,
                data: settings,
                message: 'Company settings updated successfully',
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.issues,
                });
            }

            console.error('Error updating company settings:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update company settings',
            });
        }
    }
);

export default router;
