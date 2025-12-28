import { db } from '../config/database';
import {
    transactions,
    jamaah,
    packages,
    vendors,
    vendorDebts,
    NewTransaction,
    Transaction,
} from '../db/schema';
import { eq, desc, and, sql, count, sum, gte, lte } from 'drizzle-orm';
import { auditService } from './audit.service';

interface TransactionFilters {
    type?: 'pemasukan' | 'pengeluaran';
    packageId?: string;
    jamaahId?: string;
    vendorId?: string;
    startDate?: Date;
    endDate?: Date;
    incomeCategory?: string;
    expenseCategory?: string;
}

interface Pagination {
    page: number;
    limit: number;
}

export const transactionService = {
    /**
     * Get all transactions with filters and pagination
     */
    async getAll(filters: TransactionFilters, pagination: Pagination) {
        const { page, limit } = pagination;
        const offset = (page - 1) * limit;

        const conditions = [];

        if (filters.type) {
            conditions.push(eq(transactions.type, filters.type));
        }
        if (filters.packageId) {
            conditions.push(eq(transactions.packageId, filters.packageId));
        }
        if (filters.jamaahId) {
            conditions.push(eq(transactions.jamaahId, filters.jamaahId));
        }
        if (filters.vendorId) {
            conditions.push(eq(transactions.vendorId, filters.vendorId));
        }
        if (filters.startDate) {
            conditions.push(gte(transactions.transactionDate, filters.startDate));
        }
        if (filters.endDate) {
            conditions.push(lte(transactions.transactionDate, filters.endDate));
        }
        if (filters.incomeCategory) {
            conditions.push(eq(transactions.incomeCategory, filters.incomeCategory as any));
        }
        if (filters.expenseCategory) {
            conditions.push(eq(transactions.expenseCategory, filters.expenseCategory as any));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        console.log('getAll Filters:', JSON.stringify(filters));
        // console.log('getAll Conditions:', conditions.length);

        const [data, totalResult] = await Promise.all([
            db
                .select({
                    transaction: transactions,
                    jamaah: jamaah,
                    package: packages,
                    vendor: vendors,
                })
                .from(transactions)
                .leftJoin(jamaah, eq(transactions.jamaahId, jamaah.id))
                .leftJoin(packages, eq(transactions.packageId, packages.id))
                .leftJoin(vendors, eq(transactions.vendorId, vendors.id))
                .where(whereClause)
                .orderBy(desc(transactions.transactionDate))
                .limit(limit)
                .offset(offset),
            db
                .select({ count: count() })
                .from(transactions)
                .where(whereClause),
        ]);

        return {
            data: data.map((row) => ({
                ...row.transaction,
                jamaah: row.jamaah,
                package: row.package,
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
     * Get transaction by ID
     */
    async getById(id: string): Promise<Transaction | null> {
        const [result] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.id, id));
        return result || null;
    },

    /**
     * Create income transaction
     */
    async createIncome(data: NewTransaction, userId: string): Promise<Transaction> {
        // Convert transactionDate string to Date object
        const processedData: any = {
            ...data,
            type: 'pemasukan',
            createdById: userId,
        };
        if ('transactionDate' in data) {
            processedData.transactionDate = data.transactionDate ? new Date(data.transactionDate as any) : new Date();
        }

        const [newTransaction] = await db
            .insert(transactions)
            .values(processedData)
            .returning();

        // Update jamaah payment if linked
        if (data.jamaahId) {
            await db
                .update(jamaah)
                .set({
                    paidAmount: sql`${jamaah.paidAmount} + ${data.amount}`,
                    remainingAmount: sql`${jamaah.remainingAmount} - ${data.amount}`,
                    updatedAt: new Date(),
                })
                .where(eq(jamaah.id, data.jamaahId));

            // Update payment status based on remaining amount
            const [j] = await db.select().from(jamaah).where(eq(jamaah.id, data.jamaahId));
            if (j) {
                let newStatus = 'cicilan';
                const remaining = parseFloat(j.remainingAmount || '0');
                const paid = parseFloat(j.paidAmount);
                const total = parseFloat(j.totalAmount);

                if (remaining <= 0) {
                    newStatus = 'lunas';
                } else if (paid > 0 && paid < total * 0.3) {
                    newStatus = 'dp';
                } else if (paid >= total * 0.3) {
                    newStatus = 'cicilan';
                }

                await db
                    .update(jamaah)
                    .set({ paymentStatus: newStatus as any })
                    .where(eq(jamaah.id, data.jamaahId));
            }
        }

        // Log audit
        await auditService.log({
            userId,
            action: 'create',
            entity: 'transaction',
            entityId: newTransaction.id,
            entityName: `Pemasukan: ${data.amount}`,
            newValues: newTransaction,
        });

        return newTransaction;
    },

    /**
     * Create expense transaction
     */
    async createExpense(data: NewTransaction, userId: string): Promise<Transaction> {
        // Convert transactionDate string to Date object
        const processedData: any = {
            ...data,
            type: 'pengeluaran',
            createdById: userId,
        };
        if ('transactionDate' in data) {
            processedData.transactionDate = data.transactionDate ? new Date(data.transactionDate as any) : new Date();
        }

        const [newTransaction] = await db
            .insert(transactions)
            .values(processedData)
            .returning();

        // Update package actual cost if linked
        if (data.packageId) {
            await db
                .update(packages)
                .set({
                    actualCost: sql`COALESCE(${packages.actualCost}, 0) + ${data.amount}`,
                    updatedAt: new Date(),
                })
                .where(eq(packages.id, data.packageId));
        }

        // Log audit
        await auditService.log({
            userId,
            action: 'create',
            entity: 'transaction',
            entityId: newTransaction.id,
            entityName: `Pengeluaran: ${data.amount}`,
            newValues: newTransaction,
        });

        return newTransaction;
    },

    /**
     * Update a transaction
     */
    async update(
        id: string,
        data: Partial<NewTransaction>,
        userId: string
    ): Promise<Transaction | null> {
        const existing = await this.getById(id);
        if (!existing) return null;

        // Process transactionDate if provided
        const processedData: any = { ...data, updatedAt: new Date() };
        if ('transactionDate' in data) {
            processedData.transactionDate = data.transactionDate ? new Date(data.transactionDate as any) : null;
        }

        const [updated] = await db
            .update(transactions)
            .set(processedData)
            .where(eq(transactions.id, id))
            .returning();

        // Log audit
        await auditService.log({
            userId,
            action: 'update',
            entity: 'transaction',
            entityId: id,
            oldValues: existing,
            newValues: updated,
        });

        return updated;
    },

    /**
     * Delete a transaction
     */
    async delete(id: string, userId: string): Promise<boolean> {
        const existing = await this.getById(id);
        if (!existing) return false;

        // Reverse the effects on jamaah/package if applicable
        if (existing.type === 'pemasukan' && existing.jamaahId) {
            await db
                .update(jamaah)
                .set({
                    paidAmount: sql`GREATEST(${jamaah.paidAmount} - ${existing.amount}, 0)`,
                    remainingAmount: sql`${jamaah.remainingAmount} + ${existing.amount}`,
                    updatedAt: new Date(),
                })
                .where(eq(jamaah.id, existing.jamaahId));
        }

        if (existing.type === 'pengeluaran' && existing.packageId) {
            await db
                .update(packages)
                .set({
                    actualCost: sql`GREATEST(COALESCE(${packages.actualCost}, 0) - ${existing.amount}, 0)`,
                    updatedAt: new Date(),
                })
                .where(eq(packages.id, existing.packageId));
        }

        await db.delete(transactions).where(eq(transactions.id, id));

        // Log audit
        await auditService.log({
            userId,
            action: 'delete',
            entity: 'transaction',
            entityId: id,
            oldValues: existing,
        });

        return true;
    },

    /**
     * Get cashflow summary by month
     */
    async getCashflowByMonth(months: number = 6) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const result = await db
            .select({
                month: sql<string>`TO_CHAR(${transactions.transactionDate}, 'YYYY-MM')`,
                type: transactions.type,
                total: sum(transactions.amount),
            })
            .from(transactions)
            .where(gte(transactions.transactionDate, startDate))
            .groupBy(sql`TO_CHAR(${transactions.transactionDate}, 'YYYY-MM')`, transactions.type)
            .orderBy(sql`TO_CHAR(${transactions.transactionDate}, 'YYYY-MM')`);

        // Transform into a more usable format
        const cashflow: Record<string, { pemasukan: number; pengeluaran: number }> = {};

        result.forEach((row) => {
            if (!cashflow[row.month]) {
                cashflow[row.month] = { pemasukan: 0, pengeluaran: 0 };
            }
            const amount = parseFloat(row.total || '0');
            if (row.type === 'pemasukan') {
                cashflow[row.month].pemasukan = amount;
            } else if (row.type === 'pengeluaran') {
                cashflow[row.month].pengeluaran = amount;
            }
        });

        return Object.entries(cashflow).map(([month, data]) => ({
            month,
            ...data,
            balance: data.pemasukan - data.pengeluaran,
        }));
    },

    /**
     * Get total income and expense
     */
    async getTotals(startDate?: Date, endDate?: Date) {
        const conditions = [];
        if (startDate) conditions.push(gte(transactions.transactionDate, startDate));
        if (endDate) conditions.push(lte(transactions.transactionDate, endDate));

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const result = await db
            .select({
                type: transactions.type,
                total: sum(transactions.amount),
            })
            .from(transactions)
            .where(whereClause)
            .groupBy(transactions.type);

        const totals = {
            pemasukan: 0,
            pengeluaran: 0,
            balance: 0,
        };

        result.forEach((row) => {
            const amount = parseFloat(row.total || '0');
            if (row.type === 'pemasukan') {
                totals.pemasukan = amount;
            } else if (row.type === 'pengeluaran') {
                totals.pengeluaran = amount;
            }
        });

        totals.balance = totals.pemasukan - totals.pengeluaran;

        return totals;
    },

    /**
     * Get recent transactions
     */
    async getRecent(limit: number = 10) {
        const data = await db
            .select({
                transaction: transactions,
                jamaah: jamaah,
                package: packages,
                vendor: vendors,
            })
            .from(transactions)
            .leftJoin(jamaah, eq(transactions.jamaahId, jamaah.id))
            .leftJoin(packages, eq(transactions.packageId, packages.id))
            .leftJoin(vendors, eq(transactions.vendorId, vendors.id))
            .orderBy(desc(transactions.transactionDate))
            .limit(limit);

        return data.map((row) => ({
            ...row.transaction,
            jamaah: row.jamaah,
            package: row.package,
            vendor: row.vendor,
        }));
    },
};
