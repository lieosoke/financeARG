/**
 * Report TanStack Query Hooks
 */
import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/api/index';

// Query keys
export const reportKeys = {
    all: ['reports'],
    auditLogs: () => [...reportKeys.all, 'audit'],
    auditLogList: (params) => [...reportKeys.auditLogs(), params],
    entityAudit: (entity, entityId) => [...reportKeys.auditLogs(), entity, entityId],
    profitLoss: () => [...reportKeys.all, 'profitLoss'],
    budgetActual: () => [...reportKeys.all, 'budgetActual'],
};

/**
 * Hook to fetch audit logs
 * @param {Object} params - Query parameters (page, limit, userId, action, entity, startDate, endDate)
 */
export function useAuditLogs(params = {}, options = {}) {
    return useQuery({
        queryKey: reportKeys.auditLogList(params),
        queryFn: () => reportService.getAuditLogs(params),
        ...options,
    });
}

/**
 * Hook to fetch entity-specific audit logs
 * @param {string} entity - Entity type
 * @param {string} entityId - Entity ID
 */
export function useEntityAudit(entity, entityId, options = {}) {
    return useQuery({
        queryKey: reportKeys.entityAudit(entity, entityId),
        queryFn: () => reportService.getEntityAudit(entity, entityId),
        enabled: !!entity && !!entityId,
        ...options,
    });
}

/**
 * Hook to fetch profit/loss report
 */
export function useProfitLoss(options = {}) {
    return useQuery({
        queryKey: reportKeys.profitLoss(),
        queryFn: () => reportService.getProfitLoss(),
        ...options,
    });
}

/**
 * Hook to fetch budget vs actual report
 */
export function useBudgetActual(options = {}) {
    return useQuery({
        queryKey: reportKeys.budgetActual(),
        queryFn: () => reportService.getBudgetActual(),
        ...options,
    });
}
