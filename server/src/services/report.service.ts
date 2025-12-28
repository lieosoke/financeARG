import { db } from '../config/database';
import { packages } from '../db/schema/packages';
import { transactions } from '../db/schema/transactions';
import { jamaah } from '../db/schema/jamaah';
import { eq, sql, and, gte, lte, sum, desc } from 'drizzle-orm';

/**
 * Report Service - Laba Rugi & Budget vs Actual
 */
export const reportService = {
    /**
     * Get Profit/Loss Report per Package
     */
    async getProfitLoss(filters?: {
        startDate?: Date;
        endDate?: Date;
        packageId?: string;
    }) {
        // Get all packages with their income and expenses
        const allPackages = await db.select().from(packages);

        const results = await Promise.all(
            allPackages.map(async (pkg) => {
                // Build date filter conditions
                const dateConditions = [];
                if (filters?.startDate) {
                    dateConditions.push(gte(transactions.transactionDate, filters.startDate));
                }
                if (filters?.endDate) {
                    dateConditions.push(lte(transactions.transactionDate, filters.endDate));
                }

                // Get total income for this package
                const incomeResult = await db
                    .select({
                        total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
                    })
                    .from(transactions)
                    .where(
                        and(
                            eq(transactions.packageId, pkg.id),
                            eq(transactions.type, 'pemasukan'),
                            ...dateConditions
                        )
                    );

                // Get total expenses for this package
                const expenseResult = await db
                    .select({
                        total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
                    })
                    .from(transactions)
                    .where(
                        and(
                            eq(transactions.packageId, pkg.id),
                            eq(transactions.type, 'pengeluaran'),
                            ...dateConditions
                        )
                    );

                // Get jamaah count for this package
                const jamaahCount = await db
                    .select({
                        count: sql<number>`COUNT(*)`,
                    })
                    .from(jamaah)
                    .where(eq(jamaah.packageId, pkg.id));

                const totalIncome = parseFloat(incomeResult[0]?.total || '0');
                const totalExpense = parseFloat(expenseResult[0]?.total || '0');
                const profit = totalIncome - totalExpense;
                const margin = totalIncome > 0 ? ((profit / totalIncome) * 100) : 0;

                return {
                    packageId: pkg.id,
                    packageCode: pkg.code,
                    packageName: pkg.name,
                    packageType: pkg.type,
                    status: pkg.status,
                    departureDate: pkg.departureDate,
                    totalSeats: pkg.totalSeats,
                    bookedSeats: pkg.bookedSeats || 0,
                    jamaahCount: jamaahCount[0]?.count || 0,
                    pricePerPerson: parseFloat(pkg.pricePerPerson?.toString() || '0'),
                    totalIncome,
                    totalExpense,
                    profit,
                    margin: Math.round(margin * 100) / 100,
                    isProfit: profit >= 0,
                };
            })
        );

        // Filter by packageId if provided
        const filteredResults = filters?.packageId
            ? results.filter(r => r.packageId === filters.packageId)
            : results;

        // Sort by profit descending
        filteredResults.sort((a, b) => b.profit - a.profit);

        // Calculate totals
        const summary = {
            totalIncome: filteredResults.reduce((sum, r) => sum + r.totalIncome, 0),
            totalExpense: filteredResults.reduce((sum, r) => sum + r.totalExpense, 0),
            totalProfit: filteredResults.reduce((sum, r) => sum + r.profit, 0),
            profitablePackages: filteredResults.filter(r => r.isProfit).length,
            lossPackages: filteredResults.filter(r => !r.isProfit).length,
        };

        return {
            data: filteredResults,
            summary,
        };
    },

    /**
     * Get Budget vs Actual Report per Package
     */
    async getBudgetActual(filters?: {
        packageId?: string;
        status?: string;
    }) {
        // Get all packages with budget info
        const allPackages = await db.select().from(packages);

        const results = await Promise.all(
            allPackages.map(async (pkg) => {
                // Get actual expenses from transactions
                const expenseResult = await db
                    .select({
                        total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
                    })
                    .from(transactions)
                    .where(
                        and(
                            eq(transactions.packageId, pkg.id),
                            eq(transactions.type, 'pengeluaran')
                        )
                    );

                // Get expense breakdown by category
                const expenseByCategory = await db
                    .select({
                        category: transactions.expenseCategory,
                        total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
                    })
                    .from(transactions)
                    .where(
                        and(
                            eq(transactions.packageId, pkg.id),
                            eq(transactions.type, 'pengeluaran')
                        )
                    )
                    .groupBy(transactions.expenseCategory);

                const estimatedCost = parseFloat(pkg.estimatedCost?.toString() || '0');
                const actualCost = parseFloat(expenseResult[0]?.total || '0');
                const variance = estimatedCost - actualCost;
                const variancePercent = estimatedCost > 0
                    ? ((variance / estimatedCost) * 100)
                    : 0;

                return {
                    packageId: pkg.id,
                    packageCode: pkg.code,
                    packageName: pkg.name,
                    packageType: pkg.type,
                    status: pkg.status,
                    departureDate: pkg.departureDate,
                    totalSeats: pkg.totalSeats,
                    bookedSeats: pkg.bookedSeats || 0,
                    estimatedCost,
                    actualCost,
                    variance,
                    variancePercent: Math.round(variancePercent * 100) / 100,
                    isUnderBudget: variance >= 0,
                    expenseBreakdown: expenseByCategory.map(e => ({
                        category: e.category,
                        amount: parseFloat(e.total || '0'),
                    })),
                };
            })
        );

        // Apply filters
        let filteredResults = results;
        if (filters?.packageId) {
            filteredResults = filteredResults.filter(r => r.packageId === filters.packageId);
        }
        if (filters?.status) {
            filteredResults = filteredResults.filter(r => r.status === filters.status);
        }

        // Sort by variance (most over budget first)
        filteredResults.sort((a, b) => a.variance - b.variance);

        // Calculate totals
        const summary = {
            totalEstimated: filteredResults.reduce((sum, r) => sum + r.estimatedCost, 0),
            totalActual: filteredResults.reduce((sum, r) => sum + r.actualCost, 0),
            totalVariance: filteredResults.reduce((sum, r) => sum + r.variance, 0),
            underBudgetCount: filteredResults.filter(r => r.isUnderBudget).length,
            overBudgetCount: filteredResults.filter(r => !r.isUnderBudget).length,
        };

        return {
            data: filteredResults,
            summary,
        };
    },
};
