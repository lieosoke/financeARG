/**
 * Transaction TanStack Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/api/index';

// Default query options to prevent infinite loading
const defaultQueryOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Query keys
export const transactionKeys = {
    all: ['transactions'],
    cashflow: (months) => [...transactionKeys.all, 'cashflow', months],
    totals: (startDate, endDate) => [...transactionKeys.all, 'totals', startDate, endDate],
    income: () => [...transactionKeys.all, 'income'],
    incomeList: (params) => [...transactionKeys.income(), params],
    expenses: () => [...transactionKeys.all, 'expenses'],
    expenseList: (params) => [...transactionKeys.expenses(), params],
    details: () => [...transactionKeys.all, 'detail'],
    detail: (id) => [...transactionKeys.details(), id],
};

/**
 * Hook to fetch cashflow by month
 * @param {number} months - Number of months
 */
export function useTransactionsCashflow(months = 6, options = {}) {
    return useQuery({
        queryKey: transactionKeys.cashflow(months),
        queryFn: () => transactionService.getCashflow(months),
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch transaction totals
 * @param {string} startDate - Start date (ISO string)
 * @param {string} endDate - End date (ISO string)
 */
export function useTransactionsTotals(startDate, endDate, options = {}) {
    return useQuery({
        queryKey: transactionKeys.totals(startDate, endDate),
        queryFn: () => transactionService.getTotals(startDate, endDate),
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch income transactions
 * @param {Object} params - Query parameters
 */
export function useIncomeTransactions(params = {}, options = {}) {
    return useQuery({
        queryKey: transactionKeys.incomeList(params),
        queryFn: () => transactionService.getIncome(params),
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch expense transactions
 * @param {Object} params - Query parameters
 */
export function useExpenseTransactions(params = {}, options = {}) {
    return useQuery({
        queryKey: transactionKeys.expenseList(params),
        queryFn: () => transactionService.getExpenses(params),
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch single transaction
 * @param {string} id - Transaction ID
 */
export function useTransaction(id, options = {}) {
    return useQuery({
        queryKey: transactionKeys.detail(id),
        queryFn: () => transactionService.getById(id),
        enabled: !!id,
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to create income transaction
 */
export function useCreateIncome(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => transactionService.createIncome(data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.income() });
            queryClient.invalidateQueries({ queryKey: transactionKeys.all });
            if (options.onSuccess) {
                options.onSuccess(...args);
            }
        },
    });
}

/**
 * Hook to create expense transaction
 */
export function useCreateExpense(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => transactionService.createExpense(data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.expenses() });
            queryClient.invalidateQueries({ queryKey: transactionKeys.all });
            if (options.onSuccess) {
                options.onSuccess(...args);
            }
        },
    });
}

/**
 * Hook to update a transaction
 */
export function useUpdateTransaction(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => transactionService.update(id, data),
        ...options,
        onSuccess: (data, variables, ...args) => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: transactionKeys.all });
            if (options.onSuccess) {
                options.onSuccess(data, variables, ...args);
            }
        },
    });
}

/**
 * Hook to delete a transaction
 */
export function useDeleteTransaction(options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => transactionService.remove(id),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.all });
            if (options.onSuccess) {
                options.onSuccess(...args);
            }
        },
    });
}
