import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './database';
import * as schema from '../db/schema';

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || 'http://192.168.1.31:3001', // Use IP for local network access
    basePath: '/api/v1/auth',
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications,
        },
    }),


    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Can enable later
        minPasswordLength: 8,
    },



    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes
        },
    },

    trustedOrigins: [
        // Port 80 (no port in URL)
        'http://localhost',
        'http://192.168.1.31',
        'http://127.0.0.1',
        // Localhost with ports
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3001',
        // Local network - specific IP with ports
        'http://192.168.1.31:5173',
        'http://192.168.1.31:5175',
        'http://192.168.1.31:3001',
        // Wildcard local network patterns (add more IPs as needed)
        ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : []),
    ],

    // Custom user fields
    user: {
        additionalFields: {
            role: {
                type: 'string',
                required: false,
                defaultValue: 'user',
                input: false, // Not settable via signup
            },
        },
    },
});

// Export the auth type for use in routes
export type Auth = typeof auth;
