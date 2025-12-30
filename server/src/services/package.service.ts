import { db } from '../config/database';
import { packages, NewPackage, Package, jamaah } from '../db/schema';
import { eq, desc, and, like, sql, count } from 'drizzle-orm';
import { auditService } from './audit.service';

interface PackageFilters {
    status?: string;
    type?: string;
    search?: string;
}

interface Pagination {
    page: number;
    limit: number;
}

export const packageService = {
    /**
     * Get all packages with filters and pagination
     */
    async getAll(filters: PackageFilters, pagination: Pagination) {
        const { page, limit } = pagination;
        const offset = (page - 1) * limit;

        const conditions = [];

        if (filters.status) {
            conditions.push(eq(packages.status, filters.status as any));
        }
        if (filters.type) {
            conditions.push(eq(packages.type, filters.type as any));
        }
        if (filters.search) {
            conditions.push(
                sql`(${packages.name} ILIKE ${`%${filters.search}%`} OR ${packages.code} ILIKE ${`%${filters.search}%`})`
            );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [data, totalResult] = await Promise.all([
            db
                .select()
                .from(packages)
                .where(whereClause)
                .orderBy(desc(packages.createdAt))
                .limit(limit)
                .offset(offset),
            db
                .select({ count: count() })
                .from(packages)
                .where(whereClause),
        ]);

        // Calculate filledSeats for each package by counting active jamaah
        const packagesWithFilledSeats = await Promise.all(
            data.map(async (pkg) => {
                const [jamaahCount] = await db
                    .select({ count: count() })
                    .from(jamaah)
                    .where(
                        and(
                            eq(jamaah.packageId, pkg.id),
                            eq(jamaah.isActive, true),
                            eq(jamaah.isCancelled, false)
                        )
                    );

                return {
                    ...pkg,
                    filledSeats: jamaahCount?.count || 0,
                };
            })
        );

        return {
            data: packagesWithFilledSeats,
            pagination: {
                page,
                limit,
                total: totalResult[0]?.count || 0,
                totalPages: Math.ceil((totalResult[0]?.count || 0) / limit),
            },
        };
    },

    /**
     * Get package by ID
     */
    async getById(id: string): Promise<Package | null> {
        const [pkg] = await db.select().from(packages).where(eq(packages.id, id));
        return pkg || null;
    },

    /**
     * Get package by code
     */
    async getByCode(code: string): Promise<Package | null> {
        const [pkg] = await db.select().from(packages).where(eq(packages.code, code));
        return pkg || null;
    },

    /**
     * Create a new package
     */
    async create(data: NewPackage, userId: string): Promise<Package> {
        // Convert date strings to Date objects if provided
        const processedData = {
            ...data,
            departureDate: data.departureDate ? new Date(data.departureDate as any) : null,
            returnDate: data.returnDate ? new Date(data.returnDate as any) : null,
            createdById: userId,
        };

        const [newPackage] = await db
            .insert(packages)
            .values(processedData)
            .returning();

        // Log audit
        await auditService.log({
            userId,
            action: 'create',
            entity: 'package',
            entityId: newPackage.id,
            entityName: newPackage.name,
            newValues: newPackage,
        });

        return newPackage;
    },

    /**
     * Update a package
     */
    async update(id: string, data: Partial<NewPackage>, userId: string): Promise<Package | null> {
        const existingPackage = await this.getById(id);
        if (!existingPackage) return null;

        // Process dates if provided
        const processedData: any = { ...data, updatedAt: new Date() };
        if ('departureDate' in data) {
            processedData.departureDate = data.departureDate ? new Date(data.departureDate as any) : null;
        }
        if ('returnDate' in data) {
            processedData.returnDate = data.returnDate ? new Date(data.returnDate as any) : null;
        }

        const [updated] = await db
            .update(packages)
            .set(processedData)
            .where(eq(packages.id, id))
            .returning();

        // Log audit
        await auditService.log({
            userId,
            action: 'update',
            entity: 'package',
            entityId: id,
            entityName: updated.name,
            oldValues: existingPackage,
            newValues: updated,
        });

        return updated;
    },

    /**
     * Delete a package
     */
    async delete(id: string, userId: string): Promise<boolean> {
        const existingPackage = await this.getById(id);
        if (!existingPackage) return false;

        await db.delete(packages).where(eq(packages.id, id));

        // Log audit
        await auditService.log({
            userId,
            action: 'delete',
            entity: 'package',
            entityId: id,
            entityName: existingPackage.name,
            oldValues: existingPackage,
        });

        return true;
    },

    /**
     * Get active packages count
     */
    async getActiveCount(): Promise<number> {
        const result = await db
            .select({ count: count() })
            .from(packages)
            .where(eq(packages.status, 'open'));

        return result[0]?.count || 0;
    },

    /**
     * Get package summary for a package
     */
    async getSummary(id: string) {
        const pkg = await this.getById(id);
        if (!pkg) return null;

        // Get booked seats count
        const availableSeats = pkg.totalSeats - (pkg.bookedSeats || 0);

        return {
            ...pkg,
            availableSeats,
            occupancyRate: pkg.totalSeats > 0
                ? ((pkg.bookedSeats || 0) / pkg.totalSeats) * 100
                : 0,
        };
    },
};
