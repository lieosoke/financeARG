import { db } from '../config/database';
import { jamaah, packages, transactions, invoices, invoiceItems, NewJamaah, Jamaah } from '../db/schema';
import { eq, desc, and, sql, count, sum, ne, or } from 'drizzle-orm';
import { auditService } from './audit.service';
import { notificationService } from './notification.service';

interface JamaahFilters {
    packageId?: string;
    paymentStatus?: string;
    isActive?: boolean;
    search?: string;
}

interface Pagination {
    page: number;
    limit: number;
}

export const jamaahService = {
    /**
     * Check for duplicate jamaah by NIK
     * NIK must be unique if provided
     */
    async checkDuplicate(name: string, nik: string | null, excludeId?: string): Promise<Jamaah | null> {
        // Only check for duplicate NIK if provided
        if (!nik) {
            return null;
        }

        const conditions = [
            eq(jamaah.nik, nik)
        ];

        // Exclude current jamaah when updating
        if (excludeId) {
            conditions.push(ne(jamaah.id, excludeId));
        }

        const [duplicate] = await db
            .select()
            .from(jamaah)
            .where(and(...conditions))
            .limit(1);

        return duplicate || null;
    },

    /**
     * Get all jamaah with filters and pagination
     */
    async getAll(filters: JamaahFilters, pagination: Pagination) {
        const { page, limit } = pagination;
        const offset = (page - 1) * limit;

        const conditions = [];

        if (filters.packageId) {
            conditions.push(eq(jamaah.packageId, filters.packageId));
        }
        if (filters.paymentStatus) {
            if (filters.paymentStatus === 'dp') {
                const dpCondition = or(
                    eq(jamaah.paymentStatus, 'dp'),
                    and(
                        eq(jamaah.paymentStatus, 'pending'),
                        sql`CAST(${jamaah.paidAmount} AS DECIMAL) > 0`
                    )
                );
                if (dpCondition) {
                    conditions.push(dpCondition);
                }
            } else if (filters.paymentStatus === 'pending') {
                const pendingCondition = and(
                    ne(jamaah.paymentStatus, 'lunas'),
                    ne(jamaah.paymentStatus, 'dibatalkan')
                );
                if (pendingCondition) {
                    conditions.push(pendingCondition);
                }
            } else {
                conditions.push(eq(jamaah.paymentStatus, filters.paymentStatus as any));
            }
        }
        if (filters.isActive !== undefined) {
            // conditions.push(eq(jamaah.isActive, filters.isActive));
        }
        if (filters.search) {
            conditions.push(
                sql`(${jamaah.name} ILIKE ${`%${filters.search}%`} OR ${jamaah.phone} ILIKE ${`%${filters.search}%`} OR ${jamaah.email} ILIKE ${`%${filters.search}%`})`
            );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [data, totalResult] = await Promise.all([
            db
                .select({
                    jamaah: jamaah,
                    package: packages,
                })
                .from(jamaah)
                .leftJoin(packages, eq(jamaah.packageId, packages.id))
                .where(whereClause)
                .orderBy(desc(jamaah.createdAt))
                .limit(limit)
                .offset(offset),
            db
                .select({ count: count() })
                .from(jamaah)
                .where(whereClause),
        ]);

        return {
            data: data.map((row) => {
                // Determine corrected status for legacy data
                let correctedStatus = row.jamaah.paymentStatus;
                const paid = parseFloat(row.jamaah.paidAmount || '0');
                const total = parseFloat(row.jamaah.totalAmount || '0');

                if (correctedStatus === 'pending' && paid > 0 && paid < total) {
                    correctedStatus = 'dp';
                } else if (correctedStatus === 'pending' && paid >= total) {
                    correctedStatus = 'lunas';
                }

                return {
                    ...row.jamaah,
                    paymentStatus: correctedStatus,
                    package: row.package,
                };
            }),
            pagination: {
                page,
                limit,
                total: totalResult[0]?.count || 0,
                totalPages: Math.ceil((totalResult[0]?.count || 0) / limit),
            },
        };
    },

    /**
     * Get jamaah by ID
     */
    async getById(id: string): Promise<Jamaah | null> {
        const [result] = await db.select().from(jamaah).where(eq(jamaah.id, id));
        return result || null;
    },

    /**
     * Get jamaah by ID with package info
     */
    async getByIdWithPackage(id: string) {
        const [result] = await db
            .select({
                jamaah: jamaah,
                package: packages,
            })
            .from(jamaah)
            .leftJoin(packages, eq(jamaah.packageId, packages.id))
            .where(eq(jamaah.id, id));

        if (!result) return null;

        return {
            ...result.jamaah,
            package: result.package,
        };
    },

    /**
     * Create a new jamaah
     */
    async create(data: NewJamaah, userId: string): Promise<Jamaah> {
        // Check for duplicate NIK (if provided)
        const duplicate = await this.checkDuplicate(data.name, data.nik || null);
        if (duplicate) {
            const { ApiError } = await import('../middleware/error.middleware');
            throw new ApiError(
                409,
                `NIK "${data.nik}" sudah terdaftar atas nama "${duplicate.name}". Setiap jamaah harus memiliki NIK yang unik.`
            );
        }

        // Calculate remaining amount
        const totalAmount = parseFloat(data.totalAmount);
        const paidAmount = parseFloat(data.paidAmount || '0');
        const remainingAmount = (totalAmount - paidAmount).toString();

        // Determine payment status
        let paymentStatus: 'pending' | 'dp' | 'lunas' = 'pending';
        if (paidAmount >= totalAmount) {
            paymentStatus = 'lunas';
        } else if (paidAmount > 0) {
            paymentStatus = 'dp';
        }

        // Convert date strings to Date objects
        const processedData: any = {
            ...data,
            remainingAmount,
            paymentStatus,
            createdById: userId,
        };
        if ('passportExpiry' in data) {
            processedData.passportExpiry = data.passportExpiry ? new Date(data.passportExpiry as any) : null;
        }
        if ('dateOfBirth' in data) {
            processedData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth as any) : null;
        }

        const [newJamaah] = await db
            .insert(jamaah)
            .values(processedData)
            .returning();

        // Update package booked seats if assigned
        if (data.packageId) {
            await db
                .update(packages)
                .set({
                    bookedSeats: sql`${packages.bookedSeats} + 1`,
                })
                .where(eq(packages.id, data.packageId));
        }

        // Create income transaction if there's an initial payment (DP/paidAmount)
        if (paidAmount > 0) {
            // Determine income category based on payment
            let incomeCategory: 'dp' | 'cicilan' | 'pelunasan' = 'dp';
            if (paidAmount >= totalAmount) {
                incomeCategory = 'pelunasan';
            }

            await db.insert(transactions).values({
                type: 'pemasukan',
                incomeCategory,
                amount: paidAmount.toString(),
                jamaahId: newJamaah.id,
                packageId: data.packageId || null,
                description: `Pembayaran awal (${incomeCategory.toUpperCase()}) - ${newJamaah.name}`,
                transactionDate: new Date(),
                createdById: userId,
            });
        }

        // Log audit
        await auditService.log({
            userId,
            action: 'create',
            entity: 'jamaah',
            entityId: newJamaah.id,
            entityName: newJamaah.name,
            newValues: newJamaah,
        });

        // Check seat availability and create warning notification if low
        if (data.packageId) {
            const [pkg] = await db.select().from(packages).where(eq(packages.id, data.packageId));
            if (pkg) {
                const availableSeats = pkg.totalSeats - (pkg.bookedSeats || 0);
                if (availableSeats <= 5 && availableSeats > 0) {
                    await notificationService.createForAllUsers({
                        title: 'Seat Paket Menipis',
                        message: `Paket ${pkg.name} tinggal ${availableSeats} seat tersedia`,
                        type: 'warning',
                        link: '/seat',
                    });
                } else if (availableSeats === 0) {
                    await notificationService.createForAllUsers({
                        title: 'Paket Penuh',
                        message: `Paket ${pkg.name} sudah tidak memiliki seat tersedia`,
                        type: 'error',
                        link: '/seat',
                    });
                }
            }
        }

        return newJamaah;
    },

    /**
 * Update a jamaah
 */
    async update(id: string, data: Partial<NewJamaah>, userId: string): Promise<Jamaah | null> {
        const existingJamaah = await this.getById(id);
        if (!existingJamaah) return null;

        // Check for duplicate NIK if being changed
        if (data.name || data.nik) {
            const nameToCheck = data.name || existingJamaah.name;
            const nikToCheck = data.nik !== undefined ? data.nik : existingJamaah.nik;

            const duplicate = await this.checkDuplicate(nameToCheck, nikToCheck || null, id);
            if (duplicate) {
                const { ApiError } = await import('../middleware/error.middleware');
                throw new ApiError(
                    409,
                    `NIK "${nikToCheck}" sudah terdaftar atas nama "${duplicate.name}". Setiap jamaah harus memiliki NIK yang unik.`
                );
            }
        }

        // Recalculate remaining amount if payment info changed
        let updateData: any = { ...data, updatedAt: new Date() };
        if (data.totalAmount || data.paidAmount) {
            const totalAmount = parseFloat(data.totalAmount || existingJamaah.totalAmount);
            const paidAmount = parseFloat(data.paidAmount || existingJamaah.paidAmount);
            updateData.remainingAmount = (totalAmount - paidAmount).toString();

            // Update payment status
            if (paidAmount >= totalAmount) {
                updateData.paymentStatus = 'lunas';
            } else if (paidAmount > 0) {
                updateData.paymentStatus = 'dp';
            } else {
                updateData.paymentStatus = 'pending';
            }
        }

        // Convert date strings to Date objects
        if ('passportExpiry' in data) {
            updateData.passportExpiry = data.passportExpiry ? new Date(data.passportExpiry as any) : null;
        }
        if ('dateOfBirth' in data) {
            updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth as any) : null;
        }

        const [updated] = await db
            .update(jamaah)
            .set(updateData)
            .where(eq(jamaah.id, id))
            .returning();

        // Handle package change
        if (data.packageId && data.packageId !== existingJamaah.packageId) {
            // Decrement old package
            if (existingJamaah.packageId) {
                await db
                    .update(packages)
                    .set({
                        bookedSeats: sql`GREATEST(${packages.bookedSeats} - 1, 0)`,
                    })
                    .where(eq(packages.id, existingJamaah.packageId));
            }
            // Increment new package
            await db
                .update(packages)
                .set({
                    bookedSeats: sql`${packages.bookedSeats} + 1`,
                })
                .where(eq(packages.id, data.packageId));
        }

        // Log audit
        await auditService.log({
            userId,
            action: 'update',
            entity: 'jamaah',
            entityId: id,
            entityName: updated.name,
            oldValues: existingJamaah,
            newValues: updated,
        });

        return updated;
    },

    /**
     * Delete a jamaah
     */
    async delete(id: string, userId: string): Promise<boolean> {
        const existingJamaah = await this.getById(id);
        if (!existingJamaah) return false;

        // Decrement package booked seats
        if (existingJamaah.packageId) {
            await db
                .update(packages)
                .set({
                    bookedSeats: sql`GREATEST(${packages.bookedSeats} - 1, 0)`,
                })
                .where(eq(packages.id, existingJamaah.packageId));
        }

        // Set jamaahId to null in related transactions to avoid FK constraint
        await db
            .update(transactions)
            .set({ jamaahId: null })
            .where(eq(transactions.jamaahId, id));

        // Delete related invoices (invoice_items will be deleted via cascade)
        await db.delete(invoices).where(eq(invoices.jamaahId, id));

        // Hard delete
        await db.delete(jamaah).where(eq(jamaah.id, id));

        // Log audit
        await auditService.log({
            userId,
            action: 'delete',
            entity: 'jamaah',
            entityId: id,
            entityName: existingJamaah.name,
            oldValues: existingJamaah,
        });

        return true;
    },

    /**
     * Get jamaah count by status
     */
    async getCountByStatus() {
        const result = await db
            .select({
                status: jamaah.paymentStatus,
                count: count(),
            })
            .from(jamaah)
            .groupBy(jamaah.paymentStatus);

        return result;
    },

    /**
     * Get total piutang (outstanding balance)
     */
    async getTotalPiutang(): Promise<number> {
        const result = await db
            .select({
                total: sum(jamaah.remainingAmount),
            })
            .from(jamaah)
            .where(ne(jamaah.paymentStatus, 'lunas'));

        return parseFloat(result[0]?.total || '0');
    },

    /**
     * Get jamaah with outstanding balance
     */
    async getWithOutstandingBalance(pagination: Pagination) {
        const { page, limit } = pagination;
        const offset = (page - 1) * limit;

        const conditions = and(
            ne(jamaah.paymentStatus, 'lunas'),
            sql`${jamaah.remainingAmount} > 0`
        );

        const [data, totalResult] = await Promise.all([
            db
                .select({
                    jamaah: jamaah,
                    package: packages,
                })
                .from(jamaah)
                .leftJoin(packages, eq(jamaah.packageId, packages.id))
                .where(conditions)
                .orderBy(desc(jamaah.remainingAmount))
                .limit(limit)
                .offset(offset),
            db
                .select({ count: count() })
                .from(jamaah)
                .where(conditions),
        ]);

        return {
            data: data.map((row) => ({
                ...row.jamaah,
                package: row.package,
            })),
            pagination: {
                page,
                limit,
                total: totalResult[0]?.count || 0,
                totalPages: Math.ceil((totalResult[0]?.count || 0) / limit),
            },
        };
    },

    async getActiveCount(): Promise<number> {
        const result = await db
            .select({ count: count() })
            .from(jamaah);
        // .where(eq(jamaah.isActive, true));

        return result[0]?.count || 0;
    },

    /**
     * Bulk update jamaah
     */
    async bulkUpdate(updates: { id: string; data: Partial<NewJamaah> }[], userId: string): Promise<boolean> {
        try {
            await db.transaction(async (tx) => {
                for (const update of updates) {
                    // Filter out undefined values
                    const cleanData: any = {};
                    Object.keys(update.data).forEach(key => {
                        if ((update.data as any)[key] !== undefined) {
                            cleanData[key] = (update.data as any)[key];
                        }
                    });

                    if (Object.keys(cleanData).length > 0) {
                        await tx
                            .update(jamaah)
                            .set({ ...cleanData, updatedAt: new Date() })
                            .where(eq(jamaah.id, update.id));
                    }
                }
            });
            return true;
        } catch (error) {
            console.error('Bulk update error:', error);
            return false;
        }
    },

    /**
     * Recalculate all jamaah payment data based on transaction history
     * This fixes incorrect paidAmount, remainingAmount, and paymentStatus
     */
    async recalculateAllPayments(): Promise<{ updated: number; errors: string[] }> {
        const errors: string[] = [];
        let updated = 0;

        try {
            // Get all jamaah
            const allJamaah = await db.select().from(jamaah);

            for (const j of allJamaah) {
                try {
                    // Sum all income transactions for this jamaah
                    const [transactionSum] = await db
                        .select({
                            totalCash: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`,
                            totalDiscount: sql<string>`COALESCE(SUM(CAST(${transactions.discount} AS DECIMAL)), 0)`,
                        })
                        .from(transactions)
                        .where(and(
                            eq(transactions.jamaahId, j.id),
                            eq(transactions.type, 'pemasukan')
                        ));

                    const totalCashReceived = parseFloat(transactionSum?.totalCash || '0');
                    const totalDiscountGiven = parseFloat(transactionSum?.totalDiscount || '0');
                    const totalAmount = parseFloat(j.totalAmount);

                    // Calculate correct values
                    // paidAmount = actual cash received (not including discount)
                    const correctPaidAmount = totalCashReceived;
                    // remainingAmount = totalAmount - (cash + discount)
                    const correctRemainingAmount = Math.max(0, totalAmount - totalCashReceived - totalDiscountGiven);

                    // Determine correct payment status
                    let correctStatus: 'pending' | 'dp' | 'cicilan' | 'lunas' = 'pending';
                    if (correctRemainingAmount <= 0 || correctPaidAmount >= totalAmount) {
                        correctStatus = 'lunas';
                    } else if (correctPaidAmount > 0 && correctPaidAmount < totalAmount * 0.3) {
                        correctStatus = 'dp';
                    } else if (correctPaidAmount >= totalAmount * 0.3) {
                        correctStatus = 'cicilan';
                    }

                    // Update jamaah with correct values
                    await db
                        .update(jamaah)
                        .set({
                            paidAmount: correctPaidAmount.toString(),
                            remainingAmount: correctRemainingAmount.toString(),
                            paymentStatus: correctStatus,
                            updatedAt: new Date(),
                        })
                        .where(eq(jamaah.id, j.id));

                    updated++;
                } catch (err: any) {
                    errors.push(`Failed to update jamaah ${j.name} (${j.id}): ${err.message}`);
                }
            }

            return { updated, errors };
        } catch (error: any) {
            console.error('Recalculate payments error:', error);
            throw error;
        }
    },
};
