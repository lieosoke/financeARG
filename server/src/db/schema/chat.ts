import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

// Conversations table - untuk menyimpan percakapan antar 2 user
export const conversations = pgTable('conversations', {
    id: text('id').primaryKey(),
    participant1Id: text('participant1_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    participant2Id: text('participant2_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    lastMessageAt: timestamp('last_message_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Messages table - untuk menyimpan pesan dalam percakapan
export const messages = pgTable('messages', {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id')
        .references(() => conversations.id, { onDelete: 'cascade' })
        .notNull(),
    senderId: text('sender_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    content: text('content').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type exports
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
