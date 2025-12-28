import 'dotenv/config';
import { db } from '../config/database';
import { users, accounts } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';

/**
 * Seed script to create the first admin/owner user with credentials
 * Run with: npx tsx src/scripts/seed-full.ts
 */

// Simple password hashing (in production, Better Auth handles this)
function hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
}

const SEED_USER = {
    id: crypto.randomUUID(),
    email: 'admin@argtour.com',
    name: 'Admin ARG',
    role: 'owner' as const,
    emailVerified: true,
};

const SEED_PASSWORD = 'admin123'; // Change this in production!

async function seed() {
    console.log('🌱 Seeding database with full user credentials...\n');

    try {
        // Check if user already exists
        const existing = await db
            .select()
            .from(users)
            .where(eq(users.email, SEED_USER.email));

        let userId: string;

        if (existing.length > 0) {
            userId = existing[0].id;
            console.log(`⚠️  User ${SEED_USER.email} already exists`);
            console.log('   Using existing user ID:', userId);
        } else {
            // Create seed user
            const [newUser] = await db.insert(users).values(SEED_USER).returning();
            userId = newUser.id;

            console.log('✅ Created seed user:');
            console.log('   Email:', newUser.email);
            console.log('   Name:', newUser.name);
            console.log('   Role:', newUser.role);
        }

        // Check if account exists
        const existingAccount = await db
            .select()
            .from(accounts)
            .where(eq(accounts.userId, userId));

        if (existingAccount.length > 0) {
            console.log('\n⚠️  Account already exists for this user');
        } else {
            // Create credential account (email/password)
            await db.insert(accounts).values({
                id: crypto.randomUUID(),
                userId: userId,
                accountId: userId,
                providerId: 'credential',
                accessToken: hashPassword(SEED_PASSWORD),
            });

            console.log('\n✅ Created credential account');
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔐 Login Credentials:');
        console.log('   Email:    admin@argtour.com');
        console.log('   Password: admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n✨ Seed complete!');
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

seed();
