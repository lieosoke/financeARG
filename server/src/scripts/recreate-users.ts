import 'dotenv/config';
import { db } from '../config/database';
import { users, accounts, sessions } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { auth } from '../config/auth';

async function recreateUsers() {
    console.log('🗑️ Deleting existing test users...\n');

    const testEmails = [
        'owner@argtravel.com',
        'admin@argtravel.com',
        'finance@argtravel.com',
        'ownertest@argtravel.com',
    ];

    // Delete existing users
    for (const email of testEmails) {
        try {
            const existingUser = await db.select().from(users).where(eq(users.email, email));
            if (existingUser.length > 0) {
                const userId = existingUser[0].id;
                // Delete sessions first
                await db.delete(sessions).where(eq(sessions.userId, userId));
                // Delete accounts
                await db.delete(accounts).where(eq(accounts.userId, userId));
                // Delete user
                await db.delete(users).where(eq(users.id, userId));
                console.log(`🗑️ Deleted: ${email}`);
            }
        } catch (err) {
            console.log(`⚠️ Skip delete: ${email}`);
        }
    }

    console.log('\n🌱 Creating users via Better Auth API...\n');

    const testUsers = [
        { email: 'owner@argtravel.com', name: 'Owner ARG', password: 'password123', role: 'owner' as const },
        { email: 'admin@argtravel.com', name: 'Admin ARG', password: 'password123', role: 'admin' as const },
        { email: 'finance@argtravel.com', name: 'Finance ARG', password: 'password123', role: 'finance' as const },
    ];

    for (const userData of testUsers) {
        try {
            // Use Better Auth's internal API to create user with proper password hash
            const result = await auth.api.signUpEmail({
                body: {
                    email: userData.email,
                    password: userData.password,
                    name: userData.name,
                },
            });

            if (result.user) {
                // Update the role
                await db.update(users)
                    .set({ role: userData.role })
                    .where(eq(users.id, result.user.id));

                console.log(`✅ Created: ${userData.email} (${userData.role})`);
            }
        } catch (err: any) {
            console.log(`❌ Error: ${userData.email} - ${err.message || err}`);
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

recreateUsers().catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
});
