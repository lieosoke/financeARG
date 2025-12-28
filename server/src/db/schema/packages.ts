import { pgTable, text, timestamp, integer, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

// Package status enum
export const packageStatusEnum = pgEnum('package_status', ['open', 'closed', 'ongoing', 'completed']);

// Package type enum
export const packageTypeEnum = pgEnum('package_type', ['umroh', 'haji']);

// Packages table
export const packages = pgTable('packages', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    code: text('code').notNull().unique(), // e.g., UMR-01, HJI-2024-01
    name: text('name').notNull(),
    type: packageTypeEnum('type').notNull(),
    description: text('description'),

    // Pricing
    pricePerPerson: decimal('price_per_person', { precision: 15, scale: 2 }).notNull(),

    // Capacity
    totalSeats: integer('total_seats').notNull(),
    bookedSeats: integer('booked_seats').default(0),

    // Schedule
    departureDate: timestamp('departure_date'),
    returnDate: timestamp('return_date'),

    // Status
    status: packageStatusEnum('status').default('open').notNull(),

    // Budget tracking
    estimatedCost: decimal('estimated_cost', { precision: 15, scale: 2 }),
    actualCost: decimal('actual_cost', { precision: 15, scale: 2 }).default('0'),

    // Hotel info
    hotelMakkah: text('hotel_makkah'),
    hotelMadinah: text('hotel_madinah'),

    // Airline
    airline: text('airline'),

    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdById: text('created_by_id').references(() => users.id),
});

// Type exports
export type Package = typeof packages.$inferSelect;
export type NewPackage = typeof packages.$inferInsert;
