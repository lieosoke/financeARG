/**
 * Vendor TanStack Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorService, vendorDebtService } from '../services/api/index';

// Default query options to prevent infinite loading
const defaultQueryOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Query keys
export const vendorKeys = {
    all: ['vendors'],
    lists: () => [...vendorKeys.all, 'list'],
    list: (params) => [...vendorKeys.lists(), params],
    details: () => [...vendorKeys.all, 'detail'],
    detail: (id) => [...vendorKeys.details(), id],
};

export const vendorDebtKeys = {
    all: ['vendorDebts'],
    lists: () => [...vendorDebtKeys.all, 'list'],
    list: (params) => [...vendorDebtKeys.lists(), params],
    totalOutstanding: () => [...vendorDebtKeys.all, 'totalOutstanding'],
    details: () => [...vendorDebtKeys.all, 'detail'],
    detail: (id) => [...vendorDebtKeys.details(), id],
};

// ===== VENDOR HOOKS =====

/**
 * Hook to fetch vendors list
 * @param {Object} params - Query parameters (page, limit, type, isActive, search)
 */
export function useVendors(params = {}, options = {}) {
    return useQuery({
        queryKey: vendorKeys.list(params),
        queryFn: () => vendorService.getAll(params),
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch single vendor
 * @param {string} id - Vendor ID
 */
export function useVendor(id, options = {}) {
    return useQuery({
        queryKey: vendorKeys.detail(id),
        queryFn: () => vendorService.getById(id),
        enabled: !!id,
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to create a vendor
 */
export function useCreateVendor(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => vendorService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
        },
        ...options,
    });
}

/**
 * Hook to update a vendor
 */
export function useUpdateVendor(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => vendorService.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
            queryClient.invalidateQueries({ queryKey: vendorKeys.detail(id) });
        },
        ...options,
    });
}

/**
 * Hook to delete a vendor
 */
export function useDeleteVendor(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => vendorService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
        },
        ...options,
    });
}

// ===== VENDOR DEBT HOOKS =====

/**
 * Hook to fetch vendor debts list
 * @param {Object} params - Query parameters (page, limit, vendorId, packageId, status)
 */
export function useVendorDebts(params = {}, options = {}) {
    return useQuery({
        queryKey: vendorDebtKeys.list(params),
        queryFn: () => vendorDebtService.getAll(params),
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch total outstanding debt
 */
export function useTotalOutstandingDebt(options = {}) {
    return useQuery({
        queryKey: vendorDebtKeys.totalOutstanding(),
        queryFn: () => vendorDebtService.getTotalOutstanding(),
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch single vendor debt
 * @param {string} id - Debt ID
 */
export function useVendorDebt(id, options = {}) {
    return useQuery({
        queryKey: vendorDebtKeys.detail(id),
        queryFn: () => vendorDebtService.getById(id),
        enabled: !!id,
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to create a vendor debt
 */
export function useCreateVendorDebt(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => vendorDebtService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorDebtKeys.lists() });
            queryClient.invalidateQueries({ queryKey: vendorDebtKeys.totalOutstanding() });
        },
        ...options,
    });
}

/**
 * Hook to update a vendor debt
 */
export function useUpdateVendorDebt(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => vendorDebtService.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: vendorDebtKeys.lists() });
            queryClient.invalidateQueries({ queryKey: vendorDebtKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: vendorDebtKeys.totalOutstanding() });
        },
        ...options,
    });
}

/**
 * Hook to add payment to vendor debt
 */
export function usePayVendorDebt(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, amount }) => vendorDebtService.pay(id, amount),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: vendorDebtKeys.lists() });
            queryClient.invalidateQueries({ queryKey: vendorDebtKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: vendorDebtKeys.totalOutstanding() });
        },
        ...options,
    });
}
