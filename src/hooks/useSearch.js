/**
 * Search Hook for Global Search
 * Searches across jamaah, packages, and transactions
 */
import { useQuery } from '@tanstack/react-query';
import { jamaahService, packageService, transactionService } from '../services/api/index';

// Query keys
export const searchKeys = {
    all: ['search'],
    query: (q) => [...searchKeys.all, q],
};

/**
 * Combined search results interface
 */
const searchAll = async (query) => {
    if (!query || query.length < 2) {
        return { jamaah: [], packages: [], transactions: [] };
    }

    // Search in parallel
    const [jamaahRes, packagesRes, transactionsRes] = await Promise.allSettled([
        jamaahService.getAll({ search: query, limit: 5 }),
        packageService.getAll({ search: query, limit: 5 }),
        transactionService.getCashflow({ search: query, limit: 5 }),
    ]);

    return {
        jamaah: jamaahRes.status === 'fulfilled' ? jamaahRes.value?.data || [] : [],
        packages: packagesRes.status === 'fulfilled' ? packagesRes.value?.data || [] : [],
        transactions: transactionsRes.status === 'fulfilled' ? transactionsRes.value?.data || [] : [],
    };
};

/**
 * Hook to search across all entities
 * @param {string} query - Search query
 * @param {Object} options - Additional query options
 */
export function useSearch(query, options = {}) {
    return useQuery({
        queryKey: searchKeys.query(query),
        queryFn: () => searchAll(query),
        enabled: query?.length >= 2,
        staleTime: 1000 * 30, // 30 seconds
        ...options,
    });
}

export default useSearch;
