import { db } from '../config/database';
import { auditLogs, NewAuditLog } from '../db/schema';
import { desc, eq, and, gte, lte, like } from 'drizzle-orm';

interface AuditLogParams {
    userId: string;
    userEmail?: string;
    userName?: string;
    action: string;
    entity: string;
    entityId?: string;
    entityName?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

interface AuditFilters {
    userId?: string;
    action?: string;
    entity?: string;
    startDate?: Date;
    endDate?: Date;
}

interface Pagination {
    page: number;
    limit: number;
}

export const auditService = {
    /**
     * Create an audit log entry
     */
    async log(params: AuditLogParams): Promise<void> {
        try {
            await db.insert(auditLogs).values({
                userId: params.userId,
                userEmail: params.userEmail,
                userName: params.userName,
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                entityName: params.entityName,
                oldValues: params.oldValues,
                newValues: params.newValues,
                changes: params.changes,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw - audit logging should not break the main operation
        }
    },

    /**
     * Get audit logs with filters and pagination
     */
    async getAll(filters: AuditFilters, pagination: Pagination) {
        const { page, limit } = pagination;
        const offset = (page - 1) * limit;

        const conditions = [];

        if (filters.userId) {
            conditions.push(eq(auditLogs.userId, filters.userId));
        }
        if (filters.action) {
            conditions.push(eq(auditLogs.action, filters.action));
        }
        if (filters.entity) {
            conditions.push(eq(auditLogs.entity, filters.entity));
        }
        if (filters.startDate) {
            conditions.push(gte(auditLogs.createdAt, filters.startDate));
        }
        if (filters.endDate) {
            conditions.push(lte(auditLogs.createdAt, filters.endDate));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [logs, countResult] = await Promise.all([
            db
                .select()
                .from(auditLogs)
                .where(whereClause)
                .orderBy(desc(auditLogs.createdAt))
                .limit(limit)
                .offset(offset),
            db
                .select({ count: auditLogs.id })
                .from(auditLogs)
                .where(whereClause),
        ]);

        return {
            data: logs,
            pagination: {
                page,
                limit,
                total: countResult.length,
                totalPages: Math.ceil(countResult.length / limit),
            },
        };
    },

    /**
     * Get audit log by ID
     */
    async getById(id: string) {
        const [log] = await db
            .select()
            .from(auditLogs)
            .where(eq(auditLogs.id, id));

        return log;
    },

    /**
     * Get audit logs for a specific entity
     */
    async getByEntity(entity: string, entityId: string) {
        const logs = await db
            .select()
            .from(auditLogs)
            .where(and(eq(auditLogs.entity, entity), eq(auditLogs.entityId, entityId)))
            .orderBy(desc(auditLogs.createdAt));

        return logs;
    },
};
