/**
 * Better Auth React Client
 * @see https://www.better-auth.com/docs/integrations/react
 */
import { createAuthClient } from 'better-auth/react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const authClient = createAuthClient({
    baseURL: API_BASE_URL.replace('/api/v1', ''), // Better Auth uses the base URL without prefix
    basePath: '/api/v1/auth', // This matches server's basePath config
});

// Export individual methods for convenience
export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
} = authClient;

export default authClient;
