import { Router } from 'express';
import { db } from '../config/database';
import { provinces, regencies, districts, villages } from '../db/schema';
import { eq } from 'drizzle-orm';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

/**
 * GET /regions/provinces
 * Get all provinces from local database
 */
router.get(
    '/provinces',
    asyncHandler(async (req, res) => {
        const data = await db.select().from(provinces).orderBy(provinces.name);
        res.json(data);
    })
);

/**
 * GET /regions/regencies/:provinceId
 * Get regencies by province ID from local database
 */
router.get(
    '/regencies/:provinceId',
    asyncHandler(async (req, res) => {
        const { provinceId } = req.params;
        const data = await db
            .select()
            .from(regencies)
            .where(eq(regencies.provinceId, provinceId))
            .orderBy(regencies.name);
        res.json(data);
    })
);

/**
 * GET /regions/districts/:regencyId
 * Get districts by regency ID from local database
 */
router.get(
    '/districts/:regencyId',
    asyncHandler(async (req, res) => {
        const { regencyId } = req.params;
        const data = await db
            .select()
            .from(districts)
            .where(eq(districts.regencyId, regencyId))
            .orderBy(districts.name);
        res.json(data);
    })
);

/**
 * GET /regions/villages/:districtId
 * Get villages by district ID from local database
 */
router.get(
    '/villages/:districtId',
    asyncHandler(async (req, res) => {
        const { districtId } = req.params;
        const data = await db
            .select()
            .from(villages)
            .where(eq(villages.districtId, districtId))
            .orderBy(villages.name);
        res.json(data);
    })
);

export default router;
