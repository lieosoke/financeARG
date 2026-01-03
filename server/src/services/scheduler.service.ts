import { db } from '../config/database';
import { packages } from '../db/schema';
import { eq, and, lt, lte, or, isNotNull } from 'drizzle-orm';

/**
 * Scheduler Service
 * Handles automatic status updates for packages based on dates
 */
export const schedulerService = {
    /**
     * Update package statuses based on dates
     * - Status becomes 'closed' 7 days before departure date
     * - Status becomes 'completed' after return date
     */
    async updatePackageStatuses(): Promise<{ closed: number; completed: number }> {
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);

        let closedCount = 0;
        let completedCount = 0;

        try {
            // Get all packages that need status update
            const allPackages = await db
                .select()
                .from(packages)
                .where(
                    or(
                        // Open packages that are 7 days or less before departure
                        and(
                            eq(packages.status, 'open'),
                            isNotNull(packages.departureDate),
                            lte(packages.departureDate, sevenDaysFromNow)
                        ),
                        // Ongoing or closed packages where return date has passed
                        and(
                            or(
                                eq(packages.status, 'ongoing'),
                                eq(packages.status, 'closed')
                            ),
                            isNotNull(packages.returnDate),
                            lt(packages.returnDate, now)
                        )
                    )
                );

            for (const pkg of allPackages) {
                // Check if package should be marked as completed (return date passed)
                if (
                    pkg.returnDate &&
                    new Date(pkg.returnDate) < now &&
                    (pkg.status === 'ongoing' || pkg.status === 'closed')
                ) {
                    await db
                        .update(packages)
                        .set({
                            status: 'completed',
                            updatedAt: now
                        })
                        .where(eq(packages.id, pkg.id));
                    completedCount++;
                    console.log(`[Scheduler] Package "${pkg.name}" (${pkg.code}) marked as completed`);
                }
                // Check if package should be marked as closed (7 days before departure)
                else if (
                    pkg.departureDate &&
                    new Date(pkg.departureDate) <= sevenDaysFromNow &&
                    pkg.status === 'open'
                ) {
                    await db
                        .update(packages)
                        .set({
                            status: 'closed',
                            updatedAt: now
                        })
                        .where(eq(packages.id, pkg.id));
                    closedCount++;
                    console.log(`[Scheduler] Package "${pkg.name}" (${pkg.code}) marked as closed (7 days before departure)`);
                }
            }

            if (closedCount > 0 || completedCount > 0) {
                console.log(`[Scheduler] Package status update completed: ${closedCount} closed, ${completedCount} completed`);
            }

            return { closed: closedCount, completed: completedCount };
        } catch (error) {
            console.error('[Scheduler] Error updating package statuses:', error);
            throw error;
        }
    },

    /**
     * Start the scheduler
     * Runs package status update every hour
     */
    start(): NodeJS.Timeout {
        const INTERVAL_MS = 60 * 60 * 1000; // 1 hour in milliseconds

        console.log('[Scheduler] Starting package status scheduler (runs every hour)');

        // Run immediately on startup
        this.updatePackageStatuses().catch(console.error);

        // Then run every hour
        const intervalId = setInterval(() => {
            this.updatePackageStatuses().catch(console.error);
        }, INTERVAL_MS);

        return intervalId;
    },

    /**
     * Run status update manually (for API endpoint)
     */
    async runManually(): Promise<{ closed: number; completed: number }> {
        console.log('[Scheduler] Manual package status update triggered');
        return this.updatePackageStatuses();
    }
};
