/**
 * Custom Hooks - Barrel Export
 */

// Auth
export { useAuth } from './useAuth';

// Dashboard
export {
    useDashboardOverview,
    useDashboardMetrics,
    useCashflow,
    useManifestStatus,
    useRecentTransactions,
    usePaymentStatus,
    dashboardKeys,
} from './useDashboard';

// Packages
export {
    usePackages,
    usePackage,
    usePackageSummary,
    useCreatePackage,
    useUpdatePackage,
    useDeletePackage,
    packageKeys,
} from './usePackages';

// Jamaah
export {
    useJamaahList,
    useUnpaidJamaah,
    useJamaahStats,
    useJamaah,
    useCreateJamaah,
    useUpdateJamaah,
    useDeleteJamaah,
    jamaahKeys,
} from './useJamaah';

// Transactions
export {
    useTransactionsCashflow,
    useTransactionsTotals,
    useIncomeTransactions,
    useExpenseTransactions,
    useTransaction,
    useCreateIncome,
    useCreateExpense,
    useDeleteTransaction,
    transactionKeys,
} from './useTransactions';

// Vendors
export {
    useVendors,
    useVendor,
    useCreateVendor,
    useUpdateVendor,
    useDeleteVendor,
    useVendorDebts,
    useTotalOutstandingDebt,
    useVendorDebt,
    useCreateVendorDebt,
    useUpdateVendorDebt,
    usePayVendorDebt,
    vendorKeys,
    vendorDebtKeys,
} from './useVendors';

// Reports
export {
    useAuditLogs,
    useEntityAudit,
    useProfitLoss,
    useBudgetActual,
    reportKeys,
} from './useReports';

// Search
export { useSearch, searchKeys } from './useSearch';

// Company Settings
export {
    useCompanySettings,
    useUpdateCompanySettings,
    companySettingsKeys,
} from './useCompanySettings';

