import { transactionService } from './transaction.service';
import { jamaahService } from './jamaah.service';
import { packageService } from './package.service';
import { vendorDebtService } from './vendor.service';

export const dashboardService = {
    /**
     * Get main dashboard metrics
     */
    async getMetrics() {
        const [totals, totalPiutang, activeJamaahCount, activePackageCount, totalHutang] =
            await Promise.all([
                transactionService.getTotals(),
                jamaahService.getTotalPiutang(),
                jamaahService.getActiveCount(),
                packageService.getActiveCount(),
                vendorDebtService.getTotalOutstanding(),
            ]);

        return {
            totalKas: totals.balance,
            totalPemasukan: totals.pemasukan,
            totalPengeluaran: totals.pengeluaran,
            piutangJamaah: totalPiutang,
            hutangVendor: totalHutang,
            jamaahAktif: activeJamaahCount,
            paketAktif: activePackageCount,
        };
    },

    /**
     * Get cashflow chart data
     */
    async getCashflowChart(months: number = 6) {
        return await transactionService.getCashflowByMonth(months);
    },

    /**
     * Get manifest status (seat distribution)
     */
    async getManifestStatus() {
        const { data: activePackages } = await packageService.getAll(
            { status: 'open' },
            { page: 1, limit: 10 }
        );

        return activePackages.map((pkg) => ({
            id: pkg.id,
            code: pkg.code,
            name: pkg.name,
            totalSeats: pkg.totalSeats,
            bookedSeats: pkg.bookedSeats || 0,
            availableSeats: pkg.totalSeats - (pkg.bookedSeats || 0),
            occupancyRate:
                pkg.totalSeats > 0 ? ((pkg.bookedSeats || 0) / pkg.totalSeats) * 100 : 0,
        }));
    },

    /**
     * Get recent transactions for dashboard
     */
    async getRecentTransactions(limit: number = 10) {
        return await transactionService.getRecent(limit);
    },

    /**
     * Get jamaah payment status summary
     */
    async getPaymentStatusSummary() {
        return await jamaahService.getCountByStatus();
    },

    /**
     * Get dashboard overview (all data in one call)
     */
    async getOverview() {
        const [metrics, cashflow, manifestStatus, recentTransactions, paymentStatus] =
            await Promise.all([
                this.getMetrics(),
                this.getCashflowChart(6),
                this.getManifestStatus(),
                this.getRecentTransactions(10),
                this.getPaymentStatusSummary(),
            ]);

        return {
            metrics,
            cashflow,
            manifestStatus,
            recentTransactions,
            paymentStatus,
        };
    },
};
