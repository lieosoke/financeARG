import { pgTable, text, timestamp, integer, decimal, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { packages } from './packages';
import { users } from './users';

// Payment status enum
export const paymentStatusEnum = pgEnum('payment_status', [
    'pending',
    'dp',
    'cicilan',
    'lunas',
    'dibatalkan',
]);

// Gender enum
export const genderEnum = pgEnum('gender', ['male', 'female']);

// Title enum
export const titleEnum = pgEnum('title', ['Mr', 'Mstr', 'Mrs', 'Miss', 'Infant']);

// Marital Status enum
export const maritalStatusEnum = pgEnum('marital_status', ['single', 'married', 'divorced', 'widowed']);

// Room type enum
export const roomTypeEnum = pgEnum('room_type', ['single', 'double', 'triple', 'quad', 'queen']);

// Jamaah table
export const jamaah = pgTable('jamaah', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),

    // Personal Info
    title: titleEnum('title'),
    name: text('name').notNull(),
    nik: text('nik'), // National ID (KTP)
    passportNumber: text('passport_number'),
    passportExpiry: timestamp('passport_expiry'),
    gender: genderEnum('gender'),
    maritalStatus: maritalStatusEnum('marital_status'),
    dateOfBirth: timestamp('date_of_birth'),
    placeOfBirth: text('place_of_birth'),
    phone: text('phone'),
    email: text('email'),
    address: text('address'),

    // Indonesian Region Data
    province: text('province'),        // Provinsi
    regency: text('regency'),          // Kabupaten/Kota
    district: text('district'),        // Kecamatan
    village: text('village'),          // Kelurahan/Desa

    // Emergency Contact
    emergencyContactName: text('emergency_contact_name'),
    emergencyContactPhone: text('emergency_contact_phone'),
    emergencyContactRelation: text('emergency_contact_relation'),

    // Package Assignment
    packageId: text('package_id').references(() => packages.id),
    seatNumber: integer('seat_number'),

    // Payment Info
    totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
    paidAmount: decimal('paid_amount', { precision: 15, scale: 2 }).default('0').notNull(),
    remainingAmount: decimal('remaining_amount', { precision: 15, scale: 2 }),
    paymentStatus: paymentStatusEnum('payment_status').default('pending').notNull(),

    // Room assignment for hotel
    roomType: roomTypeEnum('room_type'),
    roomNumber: text('room_number'),
    roomMate: text('room_mate'), // Name of room mate

    // Status flags
    // isActive: boolean('is_active').default(true), // Removed for hard delete
    isCancelled: boolean('is_cancelled').default(false),
    cancellationReason: text('cancellation_reason'),
    notes: text('notes'),

    // Documents
    photoUrl: text('photo_url'),
    passportScanUrl: text('passport_scan_url'),
    ktpScanUrl: text('ktp_scan_url'),

    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdById: text('created_by_id').references(() => users.id),
});

// Type exports
export type Jamaah = typeof jamaah.$inferSelect;
export type NewJamaah = typeof jamaah.$inferInsert;
