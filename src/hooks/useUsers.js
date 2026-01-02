/**
 * Users Hooks
 * TanStack Query hooks for user management
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../services/api/users';

// Query keys
export const userKeys = {
    all: ['users'],
    lists: () => [...userKeys.all, 'list'],
    list: (filters) => [...userKeys.lists(), filters],
    details: () => [...userKeys.all, 'detail'],
    detail: (id) => [...userKeys.details(), id],
};

/**
 * Get all users
 */
export const useUsers = (options = {}) => {
    return useQuery({
        queryKey: userKeys.lists(),
        queryFn: async () => {
            const response = await usersApi.getAll();
            return response.data;
        },
        ...options,
    });
};

/**
 * Get user by ID
 */
export const useUser = (id, options = {}) => {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: async () => {
            const response = await usersApi.getById(id);
            return response.data;
        },
        enabled: !!id,
        ...options,
    });
};

/**
 * Update user mutation
 */
export const useUpdateUser = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await usersApi.update(id, data);
            return response.data;
        },
        ...options,
        onSuccess: (data, variables, ...args) => {
            // Invalidate user list and detail
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
            if (options.onSuccess) {
                options.onSuccess(data, variables, ...args);
            }
        },
    });
};

/**
 * Delete user mutation
 */
export const useDeleteUser = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const response = await usersApi.delete(id);
            return response;
        },
        ...options,
        onSuccess: (...args) => {
            // Invalidate user list
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            if (options.onSuccess) {
                options.onSuccess(...args);
            }
        },
    });
};

/**
 * Create user mutation
 */
export const useCreateUser = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await usersApi.create(data);
            return response.data;
        },
        ...options,
        onSuccess: (data, variables, ...args) => {
            // Invalidate user list
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            if (options.onSuccess) {
                options.onSuccess(data, variables, ...args);
            }
        },
    });
};

/**
 * Update user password mutation
 */
export const useUpdatePassword = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await usersApi.updatePassword(id, data);
            return response;
        },
        ...options,
        onSuccess: (data, variables, ...args) => {
            queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
            if (options.onSuccess) {
                options.onSuccess(data, variables, ...args);
            }
        },
    });
};
