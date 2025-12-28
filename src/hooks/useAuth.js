/**
 * Auth Hook using Better Auth React Client
 */
import { useCallback } from 'react';
import { useSession, signIn, signUp, signOut } from '../lib/auth-client';

/**
 * Hook for authentication state and actions
 * Uses Better Auth React client for session management
 */
export function useAuth() {
    const { data: session, isPending, error, refetch } = useSession();

    const user = session?.user || null;
    const isAuthenticated = !!user;

    const login = useCallback(async (email, password) => {
        try {
            const result = await signIn.email({ email, password });
            if (result.error) {
                return { success: false, error: result.error.message };
            }
            await refetch();
            return { success: true, user: result.data?.user };
        } catch (err) {
            return { success: false, error: err.message || 'Login gagal' };
        }
    }, [refetch]);

    const register = useCallback(async (email, password, name) => {
        try {
            const result = await signUp.email({ email, password, name });
            if (result.error) {
                return { success: false, error: result.error.message };
            }
            await refetch();
            return { success: true, user: result.data?.user };
        } catch (err) {
            return { success: false, error: err.message || 'Registrasi gagal' };
        }
    }, [refetch]);

    const logout = useCallback(async () => {
        try {
            await signOut();
            await refetch();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, [refetch]);

    return {
        user,
        session,
        loading: isPending,
        error,
        isAuthenticated,
        login,
        register,
        logout,
        refetch,
    };
}

export default useAuth;
