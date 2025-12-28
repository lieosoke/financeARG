import 'dotenv/config';
import { db } from '../config/database';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Seed script to create the first admin/owner user
 * Run with: npx tsx src/scripts/seed.ts
 */

const SEED_USER = {
    id: crypto.randomUUID(),
    email: 'admin@argtour.com',
    name: 'Admin ARG',
    role: 'owner' as const,
    emailVerified: true,
};

async function seed() {
    console.log('🌱 Seeding database...\n');

    try {
        // Check if user already exists
        const existing = await db
            .select()
            .from(users)
            .where(eq(users.email, SEED_USER.email));

        if (existing.length > 0) {
            console.log(`⚠️  User ${SEED_USER.email} already exists`);
            console.log('   ID:', existing[0].id);
            console.log('   Role:', existing[0].role);
        } else {
            // Create seed user
            const [newUser] = await db.insert(users).values(SEED_USER).returning();

            console.log('✅ Created seed user:');
            console.log('   Email:', newUser.email);
            console.log('   Name:', newUser.name);
            console.log('   Role:', newUser.role);
            console.log('   ID:', newUser.id);
        }

        console.log('\n📋 Next steps:');
        console.log('   1. Use Better Auth sign-up to set password for this user');
        console.log('   2. Or create account via /api/v1/auth/sign-up/email endpoint');
        console.log('\n✨ Seed complete!');
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

seed();
