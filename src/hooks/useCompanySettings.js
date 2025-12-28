/**
 * Company Settings TanStack Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companySettingsService } from '../services/api/index';

// Query keys
export const companySettingsKeys = {
    all: ['companySettings'],
    detail: () => [...companySettingsKeys.all, 'detail'],
};

// Default query options to prevent infinite loading
const defaultQueryOptions = {
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

/**
 * Hook to fetch company settings
 * Uses long stale time since company settings rarely change
 */
export function useCompanySettings(options = {}) {
    return useQuery({
        queryKey: companySettingsKeys.detail(),
        queryFn: () => companySettingsService.get(),
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to update company settings
 */
export function useUpdateCompanySettings(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => companySettingsService.update(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: companySettingsKeys.all });
        },
        ...options,
    });
}
