import { pgTable, uuid, varchar, text, timestamp, json } from 'drizzle-orm/pg-core';

export interface BankAccount {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
}

export const companySettings = pgTable('company_settings', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    address: text('address'),
    city: varchar('city', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    email: varchar('email', { length: 255 }),
    bankAccounts: json('bank_accounts').$type<BankAccount[]>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types
export type CompanySettings = typeof companySettings.$inferSelect;
export type NewCompanySettings = typeof companySettings.$inferInsert;
