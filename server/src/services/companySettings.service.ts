import { db } from '../config/database';
import { companySettings, CompanySettings, NewCompanySettings } from '../db/schema';
import { eq } from 'drizzle-orm';
import { auditService } from './audit.service';

export const companySettingsService = {
    /**
     * Get company settings (returns the first/only record)
     */
    async get(): Promise<CompanySettings | null> {
        const [result] = await db.select().from(companySettings).limit(1);
        return result || null;
    },

    /**
     * Create or update company settings (upsert)
     */
    async upsert(data: Partial<NewCompanySettings>, userId: string): Promise<CompanySettings> {
        const existing = await this.get();

        if (existing) {
            // Update existing record
            const [updated] = await db
                .update(companySettings)
                .set({
                    ...data,
                    updatedAt: new Date(),
                })
                .where(eq(companySettings.id, existing.id))
                .returning();

            await auditService.log({
                userId,
                action: 'update',
                entity: 'company_settings',
                entityId: existing.id,
                entityName: data.name || existing.name,
                oldValues: existing,
                newValues: updated,
            });

            return updated;
        } else {
            // Create new record
            const [created] = await db
                .insert(companySettings)
                .values(data as NewCompanySettings)
                .returning();

            await auditService.log({
                userId,
                action: 'create',
                entity: 'company_settings',
                entityId: created.id,
                entityName: created.name,
                newValues: created,
            });

            return created;
        }
    },
};
