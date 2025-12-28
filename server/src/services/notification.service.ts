import { db } from '../config/database';
import { notifications, NewNotification, Notification } from '../db/schema';
import { eq, desc, and, sql, count } from 'drizzle-orm';

interface NotificationFilters {
    isRead?: boolean;
}

interface Pagination {
    page: number;
    limit: number;
}

export const notificationService = {
    /**
     * Get all notifications for a user
     */
    async getAll(userId: string, filters: NotificationFilters, pagination: Pagination) {
        const { page, limit } = pagination;
        const offset = (page - 1) * limit;

        const conditions = [eq(notifications.userId, userId)];

        if (filters.isRead !== undefined) {
            conditions.push(eq(notifications.isRead, filters.isRead));
        }

        const whereClause = and(...conditions);

        const [data, totalResult, unreadResult] = await Promise.all([
            db
                .select()
                .from(notifications)
                .where(whereClause)
                .orderBy(desc(notifications.createdAt))
                .limit(limit)
                .offset(offset),
            db
                .select({ count: count() })
                .from(notifications)
                .where(whereClause),
            db
                .select({ count: count() })
                .from(notifications)
                .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false))),
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total: totalResult[0]?.count || 0,
                totalPages: Math.ceil((totalResult[0]?.count || 0) / limit),
            },
            unreadCount: unreadResult[0]?.count || 0,
        };
    },

    /**
     * Create a notification
     */
    async create(data: NewNotification) {
        const [notification] = await db
            .insert(notifications)
            .values({
                ...data,
                id: crypto.randomUUID(),
            })
            .returning();
        return notification;
    },

    /**
     * Mark notification as read
     */
    async markAsRead(id: string, userId: string): Promise<Notification | null> {
        const [updated] = await db
            .update(notifications)
            .set({ isRead: true })
            .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
            .returning();
        return updated || null;
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId: string): Promise<boolean> {
        await db
            .update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, userId));
        return true;
    },

    /**
     * Delete notification
     */
    async delete(id: string, userId: string): Promise<boolean> {
        const [deleted] = await db
            .delete(notifications)
            .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
            .returning();
        return !!deleted;
    },
};
