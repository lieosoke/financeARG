/**
 * Dashboard TanStack Query Hooks
 */
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/api/index';

// Default query options for dashboard
const defaultQueryOptions = {
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: 30000, // Auto refresh every 30 seconds for real-time feel
    refetchOnWindowFocus: true,
};

// Query keys
export const dashboardKeys = {
    all: ['dashboard'],
    overview: () => [...dashboardKeys.all, 'overview'],
    metrics: () => [...dashboardKeys.all, 'metrics'],
    cashflow: (months) => [...dashboardKeys.all, 'cashflow', months],
    manifestStatus: () => [...dashboardKeys.all, 'manifestStatus'],
    recentTransactions: (limit) => [...dashboardKeys.all, 'recentTransactions', limit],
    paymentStatus: () => [...dashboardKeys.all, 'paymentStatus'],
};

/**
 * Hook to fetch dashboard overview
 */
export const useDashboardOverview = () => {
    return useQuery({
        queryKey: ['dashboard', 'overview'],
        queryFn: dashboardService.getOverview,
        refetchInterval: 30000, // Refresh every 30 seconds
        staleTime: 10000,
        retry: 3,
    });
};

/**
 * Hook to fetch dashboard metrics
 */
export function useDashboardMetrics(options = {}) {
    return useQuery({
        queryKey: dashboardKeys.metrics(),
        queryFn: () => dashboardService.getMetrics(),
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch cashflow chart data
 * @param {number} months - Number of months to fetch
 */
export function useCashflow(months = 6, options = {}) {
    return useQuery({
        queryKey: dashboardKeys.cashflow(months),
        queryFn: () => dashboardService.getCashflow(months),
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch manifest/seat status
 */
export function useManifestStatus(options = {}) {
    return useQuery({
        queryKey: dashboardKeys.manifestStatus(),
        queryFn: () => dashboardService.getManifestStatus(),
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch recent transactions
 * @param {number} limit - Number of transactions to fetch
 */
export function useRecentTransactions(limit = 10, options = {}) {
    return useQuery({
        queryKey: dashboardKeys.recentTransactions(limit),
        queryFn: () => dashboardService.getRecentTransactions(limit),
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch payment status summary
 */
export function usePaymentStatus(options = {}) {
    return useQuery({
        queryKey: dashboardKeys.paymentStatus(),
        queryFn: () => dashboardService.getPaymentStatus(),
        ...defaultQueryOptions,
        ...options,
    });
}
