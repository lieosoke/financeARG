/**
 * Package TanStack Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { packageService } from '../services/api/index';

// Default query options to prevent infinite loading
const defaultQueryOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Query keys
export const packageKeys = {
    all: ['packages'],
    lists: () => [...packageKeys.all, 'list'],
    list: (params) => [...packageKeys.lists(), params],
    details: () => [...packageKeys.all, 'detail'],
    detail: (id) => [...packageKeys.details(), id],
    summaries: () => [...packageKeys.all, 'summary'],
    summary: (id) => [...packageKeys.summaries(), id],
};

/**
 * Hook to fetch packages list
 * @param {Object} params - Query parameters (page, limit, status, type, search)
 */
export function usePackages(params = {}, options = {}) {
    return useQuery({
        queryKey: packageKeys.list(params),
        queryFn: () => packageService.getAll(params),
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch single package
 * @param {string} id - Package ID
 */
export function usePackage(id, options = {}) {
    return useQuery({
        queryKey: packageKeys.detail(id),
        queryFn: () => packageService.getById(id),
        enabled: !!id,
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch package summary with occupancy
 * @param {string} id - Package ID
 */
export function usePackageSummary(id, options = {}) {
    return useQuery({
        queryKey: packageKeys.summary(id),
        queryFn: () => packageService.getSummary(id),
        enabled: !!id,
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to create a package
 */
export function useCreatePackage(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => packageService.create(data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
            if (options.onSuccess) {
                options.onSuccess(...args);
            }
        },
    });
}

/**
 * Hook to update a package
 */
export function useUpdatePackage(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => packageService.update(id, data),
        ...options,
        onSuccess: (_, { id }, ...args) => {
            queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
            queryClient.invalidateQueries({ queryKey: packageKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: packageKeys.summary(id) });
            if (options.onSuccess) {
                options.onSuccess(_, { id }, ...args);
            }
        },
    });
}

/**
 * Hook to delete a package
 */
export function useDeletePackage(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => packageService.remove(id),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
            if (options.onSuccess) {
                options.onSuccess(...args);
            }
        },
    });
}
