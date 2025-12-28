import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Vendors table
export const vendors = pgTable('vendors', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    type: text('type').notNull(), // 'airline', 'hotel', 'transport', 'visa', 'muthawif', etc.
    contactPerson: text('contact_person'),
    phone: text('phone'),
    email: text('email'),
    address: text('address'),
    bankAccount: text('bank_account'),
    bankName: text('bank_name'),
    bankAccountHolder: text('bank_account_holder'),
    npwp: text('npwp'), // Tax ID
    notes: text('notes'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type exports
export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;
