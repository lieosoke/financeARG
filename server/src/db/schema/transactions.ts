import { pgTable, text, timestamp, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { packages } from './packages';
import { jamaah } from './jamaah';
import { vendors } from './vendors';
import { users } from './users';

// Transaction type enum
export const transactionTypeEnum = pgEnum('transaction_type', ['pemasukan', 'pengeluaran']);

// Income category enum
export const incomeCategoryEnum = pgEnum('income_category', [
    'dp',
    'cicilan',
    'pelunasan',
    'lainnya',
]);

// Expense category enum
export const expenseCategoryEnum = pgEnum('expense_category', [
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
]);

// Payment method enum
export const paymentMethodEnum = pgEnum('payment_method', [
    'bank_bca',
    'bank_mandiri',
    'bank_bni',
    'bank_bri',
    'bank_syariah',
    'cash',
    'transfer',
]);

// Transactions table
export const transactions = pgTable('transactions', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),

    // Transaction Type
    type: transactionTypeEnum('type').notNull(),

    // Category (based on type)
    incomeCategory: incomeCategoryEnum('income_category'),
    expenseCategory: expenseCategoryEnum('expense_category'),

    // Amount
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
    discount: decimal('discount', { precision: 15, scale: 2 }).default('0'),

    // Reference
    packageId: text('package_id').references(() => packages.id),
    jamaahId: text('jamaah_id').references(() => jamaah.id), // For income
    vendorId: text('vendor_id').references(() => vendors.id), // For expense

    // Payment Details
    paymentMethod: paymentMethodEnum('payment_method'),
    referenceNumber: text('reference_number'), // Receipt/transfer number
    bankName: text('bank_name'),

    // Description
    description: text('description'),
    notes: text('notes'),

    // Date
    transactionDate: timestamp('transaction_date').defaultNow().notNull(),

    // Document
    receiptUrl: text('receipt_url'), // File attachment

    // Audit
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdById: text('created_by_id')
        .references(() => users.id)
        .notNull(),
});

// Vendor debts/payables
export const vendorDebts = pgTable('vendor_debts', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    vendorId: text('vendor_id')
        .references(() => vendors.id)
        .notNull(),
    packageId: text('package_id').references(() => packages.id),
    description: text('description').notNull(),
    totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
    paidAmount: decimal('paid_amount', { precision: 15, scale: 2 }).default('0').notNull(),
    remainingAmount: decimal('remaining_amount', { precision: 15, scale: 2 }),
    dueDate: timestamp('due_date'),
    status: text('status').default('unpaid'), // 'unpaid', 'partial', 'paid'
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdById: text('created_by_id').references(() => users.id),
});

// Type exports
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type VendorDebt = typeof vendorDebts.$inferSelect;
export type NewVendorDebt = typeof vendorDebts.$inferInsert;
