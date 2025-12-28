import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

// Audit logs table
export const auditLogs = pgTable('audit_logs', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id),
    userEmail: text('user_email'), // Denormalized for historical reference
    userName: text('user_name'), // Denormalized for historical reference
    action: text('action').notNull(), // 'create', 'update', 'delete', 'login', 'logout'
    entity: text('entity').notNull(), // 'jamaah', 'package', 'transaction', etc.
    entityId: text('entity_id'),
    entityName: text('entity_name'), // Human readable name/title
    oldValues: jsonb('old_values'), // Previous state
    newValues: jsonb('new_values'), // New state
    changes: jsonb('changes'), // Specific fields that changed
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type exports
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
