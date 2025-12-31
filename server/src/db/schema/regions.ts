import { pgTable, text, integer } from 'drizzle-orm/pg-core';

// Indonesian Regions Tables
// Data sourced from: https://github.com/emsifa/api-wilayah-indonesia

// Provinces table (34 provinces)
export const provinces = pgTable('provinces', {
    id: text('id').primaryKey(), // e.g., "11" for ACEH
    name: text('name').notNull(), // e.g., "ACEH"
});

// Regencies/Cities table (~500 regencies)
export const regencies = pgTable('regencies', {
    id: text('id').primaryKey(), // e.g., "1101" for KABUPATEN SIMEULUE
    provinceId: text('province_id').notNull().references(() => provinces.id),
    name: text('name').notNull(), // e.g., "KABUPATEN SIMEULUE"
});

// Districts table (~7000 districts)
export const districts = pgTable('districts', {
    id: text('id').primaryKey(), // e.g., "1101010" for TEUPAH SELATAN
    regencyId: text('regency_id').notNull().references(() => regencies.id),
    name: text('name').notNull(), // e.g., "TEUPAH SELATAN"
});

// Villages table (~80000 villages)
export const villages = pgTable('villages', {
    id: text('id').primaryKey(), // e.g., "1101010001" for LATIUNG
    districtId: text('district_id').notNull().references(() => districts.id),
    name: text('name').notNull(), // e.g., "LATIUNG"
});

// Type exports
export type Province = typeof provinces.$inferSelect;
export type NewProvince = typeof provinces.$inferInsert;
export type Regency = typeof regencies.$inferSelect;
export type NewRegency = typeof regencies.$inferInsert;
export type District = typeof districts.$inferSelect;
export type NewDistrict = typeof districts.$inferInsert;
export type Village = typeof villages.$inferSelect;
export type NewVillage = typeof villages.$inferInsert;
