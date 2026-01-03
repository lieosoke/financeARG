import { Router } from 'express';
import { z } from 'zod';
import { transactionService } from '../services/transaction.service';
import { asyncHandler, ApiError } from '../middleware/error.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { financeAccess, ownerOnly } from '../middleware/rbac.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';

const router = Router();

// All transaction routes require authentication
router.use(authMiddleware);

// Validation schemas
const createIncomeSchema = z.object({
    jamaahId: z.string().min(1, 'Jamaah wajib dipilih'),
    packageId: z.string().min(1, 'Paket wajib dipilih'),
    incomeCategory: z.enum(['dp', 'cicilan', 'pelunasan', 'lainnya']),
    amount: z.string().or(z.number()).transform(String),
    discount: z.string().or(z.number()).optional().transform(val => val ? String(val) : '0'),
    paymentMethod: z
        .enum(['bank_bca', 'bank_mandiri', 'bank_bni', 'bank_bri', 'bank_syariah', 'cash', 'transfer'])
        .optional(),
    referenceNumber: z.string().optional(),
    bankName: z.string().optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    transactionDate: z.string().optional().nullable().transform(val => {
        if (!val || val === '') return null;
        const date = new Date(val);
        if (isNaN(date.getTime())) return null;
        return val;
    }),
    receiptUrl: z.string().optional(),
});

const createExpenseSchema = z.object({
    vendorId: z.string().optional(),
    packageId: z.string().optional(),
    expenseCategory: z.enum([
        'tiket_pesawat',
        'hotel',
        'hotel_transit',
        'transport',
        'visa_handling',
        'visa',
        'handling',
        'muthawif',
        'konsumsi',
        'manasik',
        'tour_leader',
        'operasional_kantor',
        'atk_kantor',
        'keperluan_kantor_lainnya',
        'ujroh',
        'lainnya',
    ]),
    amount: z.string().or(z.number()).transform(String),
    paymentMethod: z
        .enum(['cash', 'transfer']),
    referenceNumber: z.string().optional(),
    bankName: z.string().optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    transactionDate: z.string().optional().nullable().transform(val => {
        if (!val || val === '') return null;
        const date = new Date(val);
        if (isNaN(date.getTime())) return null;
        return val;
    }),
    receiptUrl: z.string().optional(),
});

const querySchema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(50),
    type: z.enum(['pemasukan', 'pengeluaran']).optional(),
    packageId: z.string().optional(),
    jamaahId: z.string().optional(),
    vendorId: z.string().optional(),
    startDate: z.string().optional().nullable().transform(val => {
        if (!val || val === '') return null;
        const date = new Date(val);
        if (isNaN(date.getTime())) return null;
        return val;
    }),
    endDate: z.string().optional().nullable().transform(val => {
        if (!val || val === '') return null;
        const date = new Date(val);
        if (isNaN(date.getTime())) return null;
        return val;
    }),
    incomeCategory: z.string().optional(),
    expenseCategory: z.string().optional(),
});

/**
 * GET /keuangan/cashflow
 * Get cashflow summary by month
 */
router.get(
    '/cashflow',
    financeAccess,
    asyncHandler(async (req, res) => {
        const months = parseInt(req.query.months as string) || 6;
        const cashflow = await transactionService.getCashflowByMonth(months);

        res.json({
            success: true,
            data: cashflow,
        });
    })
);

/**
 * GET /keuangan/totals
 * Get total income and expense
 */
router.get(
    '/totals',
    financeAccess,
    asyncHandler(async (req, res) => {
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined;

        const totals = await transactionService.getTotals(startDate, endDate);

        res.json({
            success: true,
            data: totals,
        });
    })
);

/**
 * GET /keuangan/pemasukan
 * Get all income transactions
 */
router.get(
    '/pemasukan',
    financeAccess,
    validateQuery(querySchema),
    asyncHandler(async (req, res) => {
        const { page, limit, ...filters } = req.query as any;

        const result = await transactionService.getAll(
            { ...filters, type: 'pemasukan' },
            { page, limit }
        );

        res.json({
            success: true,
            ...result,
        });
    })
);

/**
 * POST /keuangan/pemasukan
 * Create income transaction
 */
router.post(
    '/pemasukan',
    financeAccess,
    validateBody(createIncomeSchema),
    asyncHandler(async (req, res) => {
        const transaction = await transactionService.createIncome(req.body, req.user!.id);

        res.status(201).json({
            success: true,
            message: 'Income transaction created successfully',
            data: transaction,
        });
    })
);

/**
 * GET /keuangan/pengeluaran
 * Get all expense transactions
 */
router.get(
    '/pengeluaran',
    financeAccess,
    validateQuery(querySchema),
    asyncHandler(async (req, res) => {
        const { page, limit, ...filters } = req.query as any;

        const result = await transactionService.getAll(
            { ...filters, type: 'pengeluaran' },
            { page, limit }
        );

        res.json({
            success: true,
            ...result,
        });
    })
);

/**
 * POST /keuangan/pengeluaran
 * Create expense transaction
 */
router.post(
    '/pengeluaran',
    financeAccess,
    validateBody(createExpenseSchema),
    asyncHandler(async (req, res) => {
        const transaction = await transactionService.createExpense(req.body, req.user!.id);

        res.status(201).json({
            success: true,
            message: 'Expense transaction created successfully',
            data: transaction,
        });
    })
);

/**
 * GET /keuangan/:id
 * Get transaction by ID
 */
router.get(
    '/:id',
    financeAccess,
    asyncHandler(async (req, res) => {
        const transaction = await transactionService.getById(req.params.id);

        if (!transaction) {
            throw new ApiError(404, 'Transaction not found');
        }

        res.json({
            success: true,
            data: transaction,
        });
    })
);

// Update transaction schema (partial of income/expense)
const updateTransactionSchema = z.object({
    jamaahId: z.string().optional(),
    vendorId: z.string().optional(),
    packageId: z.string().optional(),
    incomeCategory: z.enum(['dp', 'cicilan', 'pelunasan', 'lainnya']).optional(),
    expenseCategory: z.enum([
        'tiket_pesawat',
        'hotel',
        'hotel_transit',
        'transport',
        'visa_handling',
        'visa',
        'handling',
        'muthawif',
        'konsumsi',
        'manasik',
        'tour_leader',
        'operasional_kantor',
        'atk_kantor',
        'keperluan_kantor_lainnya',
        'ujroh',
        'lainnya',
    ]).optional(),
    amount: z.string().or(z.number()).transform(String).optional(),
    paymentMethod: z
        .enum(['bank_bca', 'bank_mandiri', 'bank_bni', 'bank_bri', 'bank_syariah', 'cash', 'transfer'])
        .optional(),
    referenceNumber: z.string().optional(),
    bankName: z.string().optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    transactionDate: z.string().optional().nullable().transform(val => {
        if (!val || val === '') return null;
        const date = new Date(val);
        if (isNaN(date.getTime())) return null;
        return val;
    }),
    receiptUrl: z.string().optional(),
});

/**
 * PUT /keuangan/:id
 * Update a transaction
 */
router.put(
    '/:id',
    financeAccess,
    validateBody(updateTransactionSchema),
    asyncHandler(async (req, res) => {
        const updated = await transactionService.update(req.params.id, req.body, req.user!.id);

        if (!updated) {
            throw new ApiError(404, 'Transaction not found');
        }

        res.json({
            success: true,
            message: 'Transaction updated successfully',
            data: updated,
        });
    })
);

/**
 * DELETE /keuangan/:id
 * Delete a transaction
 */
router.delete(
    '/:id',
    ownerOnly,
    asyncHandler(async (req, res) => {
        const deleted = await transactionService.delete(req.params.id, req.user!.id);

        if (!deleted) {
            throw new ApiError(404, 'Transaction not found');
        }

        res.json({
            success: true,
            message: 'Transaction deleted successfully',
        });
    })
);

export default router;
