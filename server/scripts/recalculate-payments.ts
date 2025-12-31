/**
 * Script to recalculate all jamaah payment data
 * Run this with: npx tsx scripts/recalculate-payments.ts
 */

import 'dotenv/config';
import { db } from '../src/config/database';
import { jamaah, transactions } from '../src/db/schema';
import { eq, and, sql } from 'drizzle-orm';

async function recalculatePayments() {
    console.log('Starting payment recalculation...\n');

    let updated = 0;
    const errors: string[] = [];

    try {
        // Get all jamaah
        const allJamaah = await db.select().from(jamaah);
        console.log(`Found ${allJamaah.length} jamaah records to process\n`);

        for (const j of allJamaah) {
            try {
                // Sum all income transactions for this jamaah
                const [transactionSum] = await db
                    .select({
                        totalCash: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`,
                        totalDiscount: sql<string>`COALESCE(SUM(CAST(${transactions.discount} AS DECIMAL)), 0)`,
                    })
                    .from(transactions)
                    .where(and(
                        eq(transactions.jamaahId, j.id),
                        eq(transactions.type, 'pemasukan')
                    ));

                const totalCashReceived = parseFloat(transactionSum?.totalCash || '0');
                const totalDiscountGiven = parseFloat(transactionSum?.totalDiscount || '0');
                const totalAmount = parseFloat(j.totalAmount);

                // Calculate correct values
                const correctPaidAmount = totalCashReceived;
                const correctRemainingAmount = Math.max(0, totalAmount - totalCashReceived - totalDiscountGiven);

                // Determine correct payment status
                let correctStatus: 'pending' | 'dp' | 'cicilan' | 'lunas' = 'pending';
                if (correctRemainingAmount <= 0 || correctPaidAmount >= totalAmount) {
                    correctStatus = 'lunas';
                } else if (correctPaidAmount > 0 && correctPaidAmount < totalAmount * 0.3) {
                    correctStatus = 'dp';
                } else if (correctPaidAmount >= totalAmount * 0.3) {
                    correctStatus = 'cicilan';
                }

                const oldStatus = j.paymentStatus;
                const oldRemaining = parseFloat(j.remainingAmount || '0');

                // Update jamaah with correct values
                await db
                    .update(jamaah)
                    .set({
                        paidAmount: correctPaidAmount.toString(),
                        remainingAmount: correctRemainingAmount.toString(),
                        paymentStatus: correctStatus,
                        updatedAt: new Date(),
                    })
                    .where(eq(jamaah.id, j.id));

                // Log changes
                if (oldStatus !== correctStatus || Math.abs(oldRemaining - correctRemainingAmount) > 0.01) {
                    console.log(`✓ ${j.name}:`);
                    console.log(`  Status: ${oldStatus} → ${correctStatus}`);
                    console.log(`  Remaining: ${oldRemaining.toLocaleString('id-ID')} → ${correctRemainingAmount.toLocaleString('id-ID')}`);
                    console.log(`  (Cash: ${totalCashReceived.toLocaleString('id-ID')}, Discount: ${totalDiscountGiven.toLocaleString('id-ID')})`);
                    console.log('');
                }

                updated++;
            } catch (err: any) {
                errors.push(`Failed to update jamaah ${j.name} (${j.id}): ${err.message}`);
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Recalculated ${updated} jamaah records`);

        if (errors.length > 0) {
            console.log(`\n⚠️  Errors (${errors.length}):`);
            errors.forEach(e => console.log(`  - ${e}`));
        }

        console.log('\nDone!');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    }
}

recalculatePayments();
