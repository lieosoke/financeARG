/**
 * Auth Context - Provides authentication state and actions
 * Uses Better Auth React client with fallback handling
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authClient } from '../lib/auth-client';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check session on mount
    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = useCallback(async () => {
        try {
            const result = await authClient.getSession();
            if (result.data?.session) {
                setSession(result.data.session);
                setUser(result.data.user);
            } else {
                setSession(null);
                setUser(null);
            }
        } catch (err) {
            console.error('Session check failed:', err);
            setSession(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        setError(null);
        setLoading(true);
        try {
            const result = await authClient.signIn.email({
                email,
                password,
            });

            if (result.error) {
                setLoading(false);
                return { success: false, error: result.error.message || 'Login gagal' };
            }

            // Refresh session after login
            await checkSession();
            // Note: checkSession's finally block will set loading to false
            setLoading(false);
            return { success: true, user: result.data?.user };
        } catch (err) {
            setLoading(false);
            const errorMsg = err.message || 'Login gagal. Periksa koneksi ke server.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }
    }, [checkSession]);

    const register = useCallback(async (email, password, name) => {
        setError(null);
        setLoading(true);
        try {
            const result = await authClient.signUp.email({
                email,
                password,
                name,
            });

            if (result.error) {
                setLoading(false);
                return { success: false, error: result.error.message || 'Registrasi gagal' };
            }

            await checkSession();
            return { success: true, user: result.data?.user };
        } catch (err) {
            setLoading(false);
            return { success: false, error: err.message || 'Registrasi gagal' };
        }
    }, [checkSession]);

    const logout = useCallback(async () => {
        setLoading(true);
        try {
            await authClient.signOut();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            setSession(null);
            setLoading(false);
        }
    }, []);

    const value = {
        user,
        session,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refetch: checkSession,
        signIn: authClient.signIn,
        signUp: authClient.signUp,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
