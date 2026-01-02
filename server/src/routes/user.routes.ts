import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /users - List all users (owner only)
router.get('/', async (req: Request, res: Response) => {
    try {
        // Check if current user is owner
        const currentUser = (req as any).user;
        if (currentUser?.role !== 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Owner role required.',
            });
        }

        const allUsers = await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            emailVerified: users.emailVerified,
            image: users.image,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        }).from(users);

        return res.json({
            success: true,
            data: allUsers,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

// POST /users - Create a new user (owner only)
router.post('/', async (req: Request, res: Response) => {
    try {
        const currentUser = (req as any).user;
        if (currentUser?.role !== 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Owner role required.',
            });
        }

        const { email, name, role, password } = req.body;

        // Validate required fields
        if (!email || !name || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email, name, and password are required.',
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.',
            });
        }

        // Validate role
        const validRoles = ['owner', 'finance', 'admin', 'user'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be one of: owner, finance, admin, user',
            });
        }

        // Check if user already exists
        const [existingUser] = await db.select().from(users).where(eq(users.email, email));
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists.',
            });
        }

        // Use Better Auth's internal API to create user with proper password hash
        const { auth } = await import('../config/auth');
        const result = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            },
        });

        if (!result.user) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create user.',
            });
        }

        // Update the role (Better Auth creates with default role)
        const [updatedUser] = await db.update(users)
            .set({ role: role || 'user' })
            .where(eq(users.id, result.user.id))
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                emailVerified: users.emailVerified,
                image: users.image,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            });

        return res.status(201).json({
            success: true,
            data: updatedUser,
            message: 'User created successfully',
        });
    } catch (error: any) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
        });
    }
});


// GET /users/:id - Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const currentUser = (req as any).user;

        // Users can view their own profile, owners can view all
        if (currentUser?.id !== id && currentUser?.role !== 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Access denied.',
            });
        }

        const [user] = await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            emailVerified: users.emailVerified,
            image: users.image,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        }).from(users).where(eq(users.id, id));

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

// PUT /users/:id - Update user (owner only)
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, role } = req.body;
        const currentUser = (req as any).user;

        // Allow if owner OR if user is updating their own profile
        if (currentUser?.role !== 'owner' && currentUser.id !== id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only update your own profile.',
            });
        }

        // Prevent owner from changing their own role
        if (currentUser.id === id && role && role !== 'owner') {
            return res.status(400).json({
                success: false,
                message: 'Cannot change your own role.',
            });
        }

        // Validate role - only owner can change roles
        const validRoles = ['owner', 'finance', 'admin', 'user'];
        if (role) {
            if (currentUser.role !== 'owner') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Only owners can change user roles.',
                });
            }
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role. Must be one of: owner, finance, admin, user',
                });
            }
        }

        const updateData: any = {
            updatedAt: new Date(),
        };

        if (name) updateData.name = name;
        if (req.body.email) {
            // Check if email is already taken by another user
            const [existingUser] = await db.select().from(users).where(eq(users.email, req.body.email));
            if (existingUser && existingUser.id !== id) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use by another account.',
                });
            }
            updateData.email = req.body.email;
        }
        if (role) updateData.role = role;

        const [updatedUser] = await db.update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                emailVerified: users.emailVerified,
                image: users.image,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            });

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.json({
            success: true,
            data: updatedUser,
            message: 'User updated successfully',
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

// PUT /users/:id/password - Change password (owner or self)
router.put('/:id/password', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;
        const currentUser = (req as any).user;

        // Allow if owner OR if user is updating their own password
        if (currentUser?.role !== 'owner' && currentUser.id !== id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only change your own password.',
            });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long.',
            });
        }

        // Get Better Auth context for password hashing
        const { auth } = await import('../config/auth');
        const { accounts } = await import('../db/schema');
        const [account] = await db.select().from(accounts).where(eq(accounts.userId, id));

        // If user is updating their own password, verify current password
        if (currentUser.id === id) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is required.',
                });
            }

            if (!account || !account.password) {
                return res.status(400).json({
                    success: false,
                    message: 'Account not found or has no password set.',
                });
            }

            // Use Better Auth's password verification
            const ctx = await auth.$context;
            const isValid = await ctx.password.verify({
                password: currentPassword,
                hash: account.password,
            });

            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Incorrect current password.',
                });
            }
        }

        // Hash new password using Better Auth's internal context
        const ctx = await auth.$context;
        const hashedPassword = await ctx.password.hash(newPassword);

        // Update password
        const crypto = await import('crypto');
        if (account) {
            await db.update(accounts)
                .set({
                    password: hashedPassword,
                    updatedAt: new Date()
                })
                .where(eq(accounts.userId, id));
        } else {
            // Create new account if not exists
            await db.insert(accounts).values({
                id: crypto.randomUUID(),
                userId: id,
                accountId: id,
                providerId: 'credential',
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        return res.json({
            success: true,
            message: 'Password updated successfully',
        });

    } catch (error: any) {
        console.error('Error changing password:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
        });
    }
});


// DELETE /users/:id - Delete user (owner only)
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const currentUser = (req as any).user;

        // Only owner can delete users
        if (currentUser?.role !== 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Owner role required.',
            });
        }

        // Prevent owner from deleting themselves
        if (currentUser.id === id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account.',
            });
        }

        // Check if user exists first
        const [existingUser] = await db.select().from(users).where(eq(users.id, id));
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Delete related records first (sessions, accounts, auditLogs, notifications)
        const { sessions, accounts, auditLogs, notifications } = await import('../db/schema');

        // Delete notifications for this user
        await db.delete(notifications).where(eq(notifications.userId, id));

        // Delete audit logs for this user (set userId to null instead of delete to preserve history)
        await db.update(auditLogs).set({ userId: null }).where(eq(auditLogs.userId, id));

        // Delete sessions for this user
        await db.delete(sessions).where(eq(sessions.userId, id));

        // Delete accounts for this user
        await db.delete(accounts).where(eq(accounts.userId, id));

        // Now delete the user
        await db.delete(users).where(eq(users.id, id));

        return res.json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
        });
    }
});


export default router;
