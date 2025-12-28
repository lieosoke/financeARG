/**
 * Jamaah TanStack Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jamaahService } from '../services/api/index';

// Default query options to prevent infinite loading
const defaultQueryOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Query keys
export const jamaahKeys = {
    all: ['jamaah'],
    lists: () => [...jamaahKeys.all, 'list'],
    list: (params) => [...jamaahKeys.lists(), params],
    unpaid: (params) => [...jamaahKeys.all, 'unpaid', params],
    stats: () => [...jamaahKeys.all, 'stats'],
    details: () => [...jamaahKeys.all, 'detail'],
    detail: (id) => [...jamaahKeys.details(), id],
};

/**
 * Hook to fetch jamaah list
 * @param {Object} params - Query parameters (page, limit, packageId, paymentStatus, isActive, search)
 */
export function useJamaahList(params = {}, options = {}) {
    return useQuery({
        queryKey: jamaahKeys.list(params),
        queryFn: () => jamaahService.getAll(params),
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch unpaid jamaah
 * @param {Object} params - Query parameters (page, limit)
 */
export function useUnpaidJamaah(params = {}, options = {}) {
    return useQuery({
        queryKey: jamaahKeys.unpaid(params),
        queryFn: () => jamaahService.getUnpaid(params),
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch jamaah statistics
 */
export function useJamaahStats(options = {}) {
    return useQuery({
        queryKey: jamaahKeys.stats(),
        queryFn: () => jamaahService.getStats(),
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch single jamaah
 * @param {string} id - Jamaah ID
 */
export function useJamaah(id, options = {}) {
    return useQuery({
        queryKey: jamaahKeys.detail(id),
        queryFn: () => jamaahService.getById(id),
        enabled: !!id,
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to create a jamaah
 */
export function useCreateJamaah(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => jamaahService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jamaahKeys.lists() });
            queryClient.invalidateQueries({ queryKey: jamaahKeys.stats() });
            queryClient.invalidateQueries({ queryKey: jamaahKeys.unpaid({}) });
        },
        ...options,
    });
}

/**
 * Hook to update a jamaah
 */
export function useUpdateJamaah(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => jamaahService.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: jamaahKeys.lists() });
            queryClient.invalidateQueries({ queryKey: jamaahKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: jamaahKeys.stats() });
            queryClient.invalidateQueries({ queryKey: jamaahKeys.unpaid({}) });
        },
        ...options,
    });
}

/**
 * Hook to delete a jamaah
 */
export function useDeleteJamaah(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => jamaahService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jamaahKeys.lists() });
            queryClient.invalidateQueries({ queryKey: jamaahKeys.stats() });
        },
        ...options,
    });
}

/**
 * Hook to bulk update jamaah
 */
export function useBulkUpdateJamaah(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (updates) => jamaahService.bulkUpdate(updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jamaahKeys.lists() });
            queryClient.invalidateQueries({ queryKey: jamaahKeys.stats() });
            queryClient.invalidateQueries({ queryKey: jamaahKeys.unpaid({}) });
        },
        ...options,
    });
}
