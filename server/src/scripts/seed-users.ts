import 'dotenv/config';
import { db } from '../config/database';
import { users, accounts } from '../db/schema';
import * as crypto from 'crypto';

// Hash password using Better Auth compatible format (Argon2-like structure)
const hashPassword = (password: string): string => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

async function seedUsers() {
    console.log('🌱 Seeding users...\n');

    const testUsers = [
        { email: 'owner@argtravel.com', name: 'Owner ARG', role: 'owner' as const },
        { email: 'admin@argtravel.com', name: 'Admin ARG', role: 'admin' as const },
        { email: 'finance@argtravel.com', name: 'Finance ARG', role: 'finance' as const },
    ];

    for (const userData of testUsers) {
        const userId = crypto.randomUUID();
        const accountId = crypto.randomUUID();

        try {
            // Insert user
            await db.insert(users).values({
                id: userId,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            // Insert account with password
            await db.insert(accounts).values({
                id: accountId,
                userId: userId,
                accountId: userId,
                providerId: 'credential',
                password: hashPassword('password123'),
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            console.log(`✅ Created: ${userData.email} (${userData.role})`);
        } catch (err: any) {
            if (err.code === '23505') {
                console.log(`⏭️  Skip: ${userData.email} (already exists)`);
            } else {
                console.log(`❌ Error: ${userData.email} - ${err.message}`);
            }
        }
    }

    console.log('\n📋 Test Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email: owner@argtravel.com | Password: password123 | Role: Owner');
    console.log('Email: admin@argtravel.com | Password: password123 | Role: Admin');
    console.log('Email: finance@argtravel.com | Password: password123 | Role: Finance');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
}

seedUsers().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
