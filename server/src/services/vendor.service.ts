import { db } from '../config/database';
import { vendors, vendorDebts, NewVendor, Vendor, NewVendorDebt, VendorDebt } from '../db/schema';
import { eq, desc, and, sql, count, sum } from 'drizzle-orm';
import { auditService } from './audit.service';
import { notificationService } from './notification.service';

interface VendorFilters {
    type?: string;
    isActive?: boolean;
    search?: string;
}

interface Pagination {
    page: number;
    limit: number;
}

export const vendorService = {
    /**
     * Get all vendors with filters and pagination
     */
    async getAll(filters: VendorFilters, pagination: Pagination) {
        const { page, limit } = pagination;
        const offset = (page - 1) * limit;

        const conditions = [];

        if (filters.type) {
            conditions.push(eq(vendors.type, filters.type));
        }
        if (filters.isActive !== undefined) {
            conditions.push(eq(vendors.isActive, filters.isActive));
        }
        if (filters.search) {
            conditions.push(
                sql`(${vendors.name} ILIKE ${`%${filters.search}%`} OR ${vendors.contactPerson} ILIKE ${`%${filters.search}%`})`
            );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [data, totalResult] = await Promise.all([
            db
                .select()
                .from(vendors)
                .where(whereClause)
                .orderBy(desc(vendors.createdAt))
                .limit(limit)
                .offset(offset),
            db
                .select({ count: count() })
                .from(vendors)
                .where(whereClause),
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total: totalResult[0]?.count || 0,
                totalPages: Math.ceil((totalResult[0]?.count || 0) / limit),
            },
        };
    },

    /**
     * Get vendor by ID
     */
    async getById(id: string): Promise<Vendor | null> {
        const [result] = await db.select().from(vendors).where(eq(vendors.id, id));
        return result || null;
    },

    /**
     * Create a new vendor
     */
    async create(data: NewVendor, userId: string): Promise<Vendor> {
        const [newVendor] = await db.insert(vendors).values(data).returning();

        await auditService.log({
            userId,
            action: 'create',
            entity: 'vendor',
            entityId: newVendor.id,
            entityName: newVendor.name,
            newValues: newVendor,
        });

        return newVendor;
    },

    /**
     * Update a vendor
     */
    async update(id: string, data: Partial<NewVendor>, userId: string): Promise<Vendor | null> {
        const existing = await this.getById(id);
        if (!existing) return null;

        const [updated] = await db
            .update(vendors)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(vendors.id, id))
            .returning();

        await auditService.log({
            userId,
            action: 'update',
            entity: 'vendor',
            entityId: id,
            entityName: updated.name,
            oldValues: existing,
            newValues: updated,
        });

        return updated;
    },

    /**
     * Delete a vendor (soft delete)
     */
    async delete(id: string, userId: string): Promise<boolean> {
        const existing = await this.getById(id);
        if (!existing) return false;

        await db
            .update(vendors)
            .set({ isActive: false, updatedAt: new Date() })
            .where(eq(vendors.id, id));

        await auditService.log({
            userId,
            action: 'delete',
            entity: 'vendor',
            entityId: id,
            entityName: existing.name,
            oldValues: existing,
        });

        return true;
    },
};

// Vendor Debts Service
export const vendorDebtService = {
    /**
     * Get all vendor debts with filters and pagination
     */
    async getAll(
        filters: { vendorId?: string; packageId?: string; status?: string },
        pagination: Pagination
    ) {
        const { page, limit } = pagination;
        const offset = (page - 1) * limit;

        const conditions = [];

        if (filters.vendorId) {
            conditions.push(eq(vendorDebts.vendorId, filters.vendorId));
        }
        if (filters.packageId) {
            conditions.push(eq(vendorDebts.packageId, filters.packageId));
        }
        if (filters.status) {
            conditions.push(eq(vendorDebts.status, filters.status));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [data, totalResult] = await Promise.all([
            db
                .select({
                    debt: vendorDebts,
                    vendor: vendors,
                })
                .from(vendorDebts)
                .leftJoin(vendors, eq(vendorDebts.vendorId, vendors.id))
                .where(whereClause)
                .orderBy(desc(vendorDebts.createdAt))
                .limit(limit)
                .offset(offset),
            db
                .select({ count: count() })
                .from(vendorDebts)
                .where(whereClause),
        ]);

        return {
            data: data.map((row) => ({
                ...row.debt,
                vendor: row.vendor,
            })),
            pagination: {
                page,
                limit,
                total: totalResult[0]?.count || 0,
                totalPages: Math.ceil((totalResult[0]?.count || 0) / limit),
            },
        };
    },

    /**
     * Get vendor debt by ID
     */
    async getById(id: string): Promise<VendorDebt | null> {
        const [result] = await db.select().from(vendorDebts).where(eq(vendorDebts.id, id));
        return result || null;
    },

    /**
     * Create a vendor debt
     */
    async create(data: NewVendorDebt, userId: string): Promise<VendorDebt> {
        const totalAmount = parseFloat(data.totalAmount);
        const paidAmount = parseFloat(data.paidAmount || '0');
        const remainingAmount = (totalAmount - paidAmount).toString();

        let status = 'unpaid';
        if (paidAmount >= totalAmount) {
            status = 'paid';
        } else if (paidAmount > 0) {
            status = 'partial';
        }

        // Convert dueDate string to Date object if provided
        const processedData: any = {
            ...data,
            remainingAmount,
            status,
            createdById: userId,
        };
        if ('dueDate' in data) {
            processedData.dueDate = data.dueDate ? new Date(data.dueDate as any) : null;
        }

        const [newDebt] = await db
            .insert(vendorDebts)
            .values(processedData)
            .returning();

        await auditService.log({
            userId,
            action: 'create',
            entity: 'vendor_debt',
            entityId: newDebt.id,
            entityName: data.description,
            newValues: newDebt,
        });

        // Create notification for new vendor debt
        const vendorInfo = await db.select().from(vendors).where(eq(vendors.id, data.vendorId)).then(r => r[0]);
        const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(parseFloat(data.totalAmount));

        await notificationService.createForAllUsers({
            title: 'Hutang Vendor Baru',
            message: `Hutang ${formattedAmount} ke ${vendorInfo?.name || 'vendor'} telah dicatat`,
            type: 'warning',
            link: '/keuangan/hutang',
        });

        return newDebt;
    },

    /**
     * Update a vendor debt
     */
    async update(id: string, data: Partial<NewVendorDebt>, userId: string): Promise<VendorDebt | null> {
        const existing = await this.getById(id);
        if (!existing) return null;

        // Recalculate remaining and status if payment changed
        let updateData = { ...data };
        if (data.totalAmount || data.paidAmount) {
            const totalAmount = parseFloat(data.totalAmount || existing.totalAmount);
            const paidAmount = parseFloat(data.paidAmount || existing.paidAmount);
            updateData.remainingAmount = (totalAmount - paidAmount).toString();

            let status = 'unpaid';
            if (paidAmount >= totalAmount) {
                status = 'paid';
            } else if (paidAmount > 0) {
                status = 'partial';
            }
            updateData.status = status;
        }

        // Convert dueDate string to Date object if provided
        if ('dueDate' in updateData) {
            updateData.dueDate = updateData.dueDate ? new Date(updateData.dueDate as any) : null;
        }

        const [updated] = await db
            .update(vendorDebts)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(vendorDebts.id, id))
            .returning();

        await auditService.log({
            userId,
            action: 'update',
            entity: 'vendor_debt',
            entityId: id,
            oldValues: existing,
            newValues: updated,
        });

        return updated;
    },

    /**
     * Pay vendor debt
     */
    async addPayment(id: string, amount: number, userId: string): Promise<VendorDebt | null> {
        const existing = await this.getById(id);
        if (!existing) return null;

        const newPaidAmount = parseFloat(existing.paidAmount) + amount;
        const newRemainingAmount = parseFloat(existing.totalAmount) - newPaidAmount;

        let status = 'partial';
        if (newRemainingAmount <= 0) {
            status = 'paid';
        }

        const [updated] = await db
            .update(vendorDebts)
            .set({
                paidAmount: newPaidAmount.toString(),
                remainingAmount: Math.max(0, newRemainingAmount).toString(),
                status,
                updatedAt: new Date(),
            })
            .where(eq(vendorDebts.id, id))
            .returning();

        await auditService.log({
            userId,
            action: 'update',
            entity: 'vendor_debt',
            entityId: id,
            entityName: `Payment: ${amount}`,
            oldValues: existing,
            newValues: updated,
        });

        // Create notification for vendor debt payment
        const vendorInfo = await db.select().from(vendors).where(eq(vendors.id, existing.vendorId)).then(r => r[0]);
        const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

        if (status === 'paid') {
            await notificationService.createForAllUsers({
                title: 'Hutang Vendor Lunas',
                message: `Hutang ke ${vendorInfo?.name || 'vendor'} telah lunas`,
                type: 'success',
                link: '/keuangan/hutang',
            });
        } else {
            await notificationService.createForAllUsers({
                title: 'Pembayaran Hutang Vendor',
                message: `Pembayaran ${formattedAmount} ke ${vendorInfo?.name || 'vendor'}`,
                type: 'info',
                link: '/keuangan/hutang',
            });
        }

        return updated;
    },

    /**
     * Get total outstanding debts
     */
    async getTotalOutstanding(): Promise<number> {
        const result = await db
            .select({
                total: sum(vendorDebts.remainingAmount),
            })
            .from(vendorDebts)
            .where(sql`${vendorDebts.status} != 'paid'`);

        return parseFloat(result[0]?.total || '0');
    },

    /**
     * Delete a vendor debt
     */
    async delete(id: string, userId: string): Promise<boolean> {
        const existing = await this.getById(id);
        if (!existing) return false;

        await db.delete(vendorDebts).where(eq(vendorDebts.id, id));

        await auditService.log({
            userId,
            action: 'delete',
            entity: 'vendor_debt',
            entityId: id,
            entityName: existing.description,
            oldValues: existing,
        });

        return true;
    },
};
