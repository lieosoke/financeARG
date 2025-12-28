import { pgTable, text, timestamp, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { jamaah } from './jamaah';
import { packages } from './packages';
import { users } from './users';

// Invoice status enum
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'sent', 'paid', 'cancelled']);

// Invoices table
export const invoices = pgTable('invoices', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    invoiceNumber: text('invoice_number').notNull().unique(),
    jamaahId: text('jamaah_id')
        .references(() => jamaah.id)
        .notNull(),
    packageId: text('package_id')
        .references(() => packages.id)
        .notNull(),

    // Amount details
    subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull(),
    discount: decimal('discount', { precision: 15, scale: 2 }).default('0'),
    total: decimal('total', { precision: 15, scale: 2 }).notNull(),

    // Status
    status: invoiceStatusEnum('status').default('draft').notNull(),

    // Dates
    issueDate: timestamp('issue_date').defaultNow().notNull(),
    dueDate: timestamp('due_date'),
    paidDate: timestamp('paid_date'),

    // Invoice details
    billingAddress: text('billing_address'),
    notes: text('notes'),
    terms: text('terms'),

    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdById: text('created_by_id').references(() => users.id),
});

// Invoice items (line items)
export const invoiceItems = pgTable('invoice_items', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    invoiceId: text('invoice_id')
        .references(() => invoices.id, { onDelete: 'cascade' })
        .notNull(),
    description: text('description').notNull(),
    quantity: decimal('quantity', { precision: 10, scale: 2 }).default('1').notNull(),
    unitPrice: decimal('unit_price', { precision: 15, scale: 2 }).notNull(),
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type exports
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
