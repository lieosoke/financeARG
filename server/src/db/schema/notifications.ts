import { pgTable, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

// Notification type enum
export const notificationTypeEnum = pgEnum('notification_type', ['info', 'success', 'warning', 'error']);

// Notifications table
export const notifications = pgTable('notifications', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    type: notificationTypeEnum('type').default('info').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    link: text('link'), // Optional link to redirect
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type exports
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
