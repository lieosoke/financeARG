import { db } from '../config/database';
import {
    transactions,
    jamaah,
    packages,
    vendors,
    vendorDebts,
    invoices,
    invoiceItems,
    NewTransaction,
    Transaction,
} from '../db/schema';
import { eq, desc, and, sql, count, sum, gte, lte } from 'drizzle-orm';
import { auditService } from './audit.service';
import { notificationService } from './notification.service';

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
    async createIncome(data: NewTransaction & { discount?: string }, userId: string): Promise<Transaction> {
        // Calculate net amount after discount
        const grossAmount = parseFloat(data.amount);
        const discount = parseFloat(data.discount || '0');
        const netAmount = grossAmount - discount;

        // Convert transactionDate string to Date object
        const processedData: any = {
            ...data,
            type: 'pemasukan',
            discount: data.discount || '0',
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
        // - paidAmount: increases by netAmount (actual money received)
        // - remainingAmount: decreases by grossAmount (payment + discount = total credit applied)
        // This ensures discount reduces what jamaah owes, not counted as debt
        if (data.jamaahId) {
            await db
                .update(jamaah)
                .set({
                    paidAmount: sql`${jamaah.paidAmount} + ${netAmount}`,
                    remainingAmount: sql`${jamaah.remainingAmount} - ${grossAmount}`,
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

        // Create invoice automatically if jamaah and package are linked
        if (data.jamaahId && data.packageId) {
            try {
                await this.createInvoiceFromTransaction({
                    jamaahId: data.jamaahId,
                    packageId: data.packageId,
                    subtotal: data.amount,
                    discount: data.discount || '0',
                    total: String(netAmount),
                    transactionId: newTransaction.id,
                    incomeCategory: data.incomeCategory || 'lainnya',
                    description: data.description || undefined,
                }, userId);
            } catch (error) {
                console.error('Failed to create invoice:', error);
                // Don't fail the transaction if invoice creation fails
            }
        }

        // Log audit
        await auditService.log({
            userId,
            action: 'create',
            entity: 'transaction',
            entityId: newTransaction.id,
            entityName: `Pemasukan: ${data.amount}${discount > 0 ? ` (Diskon: ${discount})` : ''}`,
            newValues: newTransaction,
        });

        // Create notification for income
        const jamaahInfo = data.jamaahId
            ? await db.select().from(jamaah).where(eq(jamaah.id, data.jamaahId)).then(r => r[0])
            : null;
        const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(netAmount);

        await notificationService.createForAllUsers({
            title: 'Pembayaran Masuk',
            message: jamaahInfo
                ? `Pembayaran ${formattedAmount} dari ${jamaahInfo.name}${discount > 0 ? ' (termasuk diskon)' : ''}`
                : `Pemasukan ${formattedAmount} telah dicatat`,
            type: 'success',
            link: '/keuangan/pemasukan',
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

        // Create notification for expense
        const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(parseFloat(data.amount));

        await notificationService.createForAllUsers({
            title: 'Pengeluaran Tercatat',
            message: `Pengeluaran ${formattedAmount} - ${data.description || 'Tidak ada deskripsi'}`,
            type: 'info',
            link: '/keuangan/pengeluaran',
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
            // Calculate amounts to reverse (must match createIncome logic)
            const grossAmount = parseFloat(existing.amount);
            const discount = parseFloat(existing.discount || '0');
            const netAmount = grossAmount - discount;

            // Reverse the payment amounts
            // - paidAmount: decrease by netAmount (actual money that was received)
            // - remainingAmount: increase by grossAmount (payment + discount = total credit applied)
            await db
                .update(jamaah)
                .set({
                    paidAmount: sql`GREATEST(${jamaah.paidAmount} - ${netAmount}, 0)`,
                    remainingAmount: sql`${jamaah.remainingAmount} + ${grossAmount}`,
                    updatedAt: new Date(),
                })
                .where(eq(jamaah.id, existing.jamaahId));

            // Recalculate payment status after deletion
            const [j] = await db.select().from(jamaah).where(eq(jamaah.id, existing.jamaahId));
            if (j) {
                let newStatus = 'pending';
                const remaining = parseFloat(j.remainingAmount || '0');
                const paid = parseFloat(j.paidAmount);
                const total = parseFloat(j.totalAmount);

                if (remaining <= 0 || paid >= total) {
                    newStatus = 'lunas';
                } else if (paid > 0 && paid < total * 0.3) {
                    newStatus = 'dp';
                } else if (paid >= total * 0.3) {
                    newStatus = 'cicilan';
                }

                await db
                    .update(jamaah)
                    .set({ paymentStatus: newStatus as any })
                    .where(eq(jamaah.id, existing.jamaahId));
            }
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

    /**
     * Create invoice from income transaction
     */
    async createInvoiceFromTransaction(
        data: {
            jamaahId: string;
            packageId: string;
            subtotal: string;
            discount: string;
            total: string;
            transactionId: string;
            incomeCategory: string;
            description?: string;
        },
        userId: string
    ) {
        // Generate invoice number: INV-YYYYMM-XXXXX
        const now = new Date();
        const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
        const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
        const invoiceNumber = `INV-${yearMonth}-${randomSuffix}`;

        // Fetch package info for invoice item description
        const [packageInfo] = await db.select().from(packages).where(eq(packages.id, data.packageId));
        const packageName = packageInfo?.name || 'Paket';

        // Map income category to description
        const categoryLabels: Record<string, string> = {
            dp: 'Down Payment (DP)',
            cicilan: 'Pembayaran Cicilan',
            pelunasan: 'Pelunasan',
            lainnya: 'Pembayaran Lainnya',
        };

        const categoryLabel = categoryLabels[data.incomeCategory] || 'Pembayaran';
        const itemDescription = data.description
            ? `${packageName} - ${data.description}`
            : `${packageName} - ${categoryLabel}`;

        // Create invoice
        const [newInvoice] = await db
            .insert(invoices)
            .values({
                invoiceNumber,
                jamaahId: data.jamaahId,
                packageId: data.packageId,
                subtotal: data.subtotal,
                discount: data.discount,
                total: data.total,
                status: 'paid',
                issueDate: now,
                paidDate: now,
                createdById: userId,
            })
            .returning();

        // Create invoice item with package name
        await db.insert(invoiceItems).values({
            invoiceId: newInvoice.id,
            description: itemDescription,
            quantity: '1',
            unitPrice: data.subtotal,
            amount: data.total,
        });

        // Create notification for invoice
        await notificationService.createForAllUsers({
            title: 'Invoice Dibuat',
            message: `Invoice ${invoiceNumber} telah dibuat otomatis`,
            type: 'info',
            link: '/laporan/invoice',
        });

        return newInvoice;
    },
};
