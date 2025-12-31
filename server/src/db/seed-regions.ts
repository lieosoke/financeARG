/**
 * Seeder script to populate Indonesian region data from LOCAL files
 * Run with: npx tsx src/db/seed-regions.ts
 * 
 * Expected folder structure at D:\xampp\htdocs\api-indonesia:
 * api-indonesia/
 * ├── api/
 * │   ├── provinces.json
 * │   ├── regencies/
 * │   │   ├── {provinceId}.json
 * │   ├── districts/
 * │   │   ├── {regencyId}.json
 * │   └── villages/
 * │       ├── {districtId}.json
 */
import 'dotenv/config';
import { db } from '../config/database';
import { provinces, regencies, districts, villages } from './schema';
import * as fs from 'fs';
import * as path from 'path';

// Local data path - change this if needed
const DATA_PATH = 'D:/xampp/htdocs/api-indonesia/static/api';

function readJsonFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}

async function seedProvinces() {
    console.log('🏛️  Loading provinces from local file...');
    const data = readJsonFile(path.join(DATA_PATH, 'provinces.json'));
    console.log(`   Found ${data.length} provinces`);

    // Insert in batches
    for (const item of data) {
        await db.insert(provinces).values({
            id: item.id,
            name: item.name,
        }).onConflictDoNothing();
    }
    console.log('   ✅ Provinces seeded');
    return data;
}

async function seedRegencies(provincesData: any[]) {
    console.log('🏙️  Loading regencies from local files...');
    let total = 0;

    for (const prov of provincesData) {
        const filePath = path.join(DATA_PATH, 'regencies', `${prov.id}.json`);
        if (!fs.existsSync(filePath)) {
            console.log(`   ⚠️ File not found: ${filePath}`);
            continue;
        }

        const data = readJsonFile(filePath);
        total += data.length;

        for (const item of data) {
            await db.insert(regencies).values({
                id: item.id,
                provinceId: item.province_id,
                name: item.name,
            }).onConflictDoNothing();
        }
        process.stdout.write(`   Province ${prov.name} - ${data.length} regencies\r`);
    }
    console.log(`\n   ✅ ${total} regencies seeded`);
}

async function seedDistricts() {
    console.log('🏘️  Loading districts from local files...');

    // Get all regencies from DB
    const allRegencies = await db.select().from(regencies);
    let total = 0;

    for (let i = 0; i < allRegencies.length; i++) {
        const reg = allRegencies[i];
        const filePath = path.join(DATA_PATH, 'districts', `${reg.id}.json`);

        if (!fs.existsSync(filePath)) continue;

        try {
            const data = readJsonFile(filePath);
            total += data.length;

            for (const item of data) {
                await db.insert(districts).values({
                    id: item.id,
                    regencyId: item.regency_id,
                    name: item.name,
                }).onConflictDoNothing();
            }
            process.stdout.write(`   Progress: ${i + 1}/${allRegencies.length} regencies\r`);
        } catch (error) {
            console.error(`   ⚠️ Error reading file for regency ${reg.id}: ${reg.name}`);
        }
    }
    console.log(`\n   ✅ ${total} districts seeded`);
}

async function seedVillages() {
    console.log('🏠 Loading villages from local files...');

    // Get all districts from DB
    const allDistricts = await db.select().from(districts);
    let total = 0;
    let errors = 0;

    for (let i = 0; i < allDistricts.length; i++) {
        const dist = allDistricts[i];
        const filePath = path.join(DATA_PATH, 'villages', `${dist.id}.json`);

        if (!fs.existsSync(filePath)) {
            errors++;
            continue;
        }

        try {
            const data = readJsonFile(filePath);
            total += data.length;

            // Batch insert for performance
            if (data.length > 0) {
                const values = data.map((item: any) => ({
                    id: item.id,
                    districtId: item.district_id,
                    name: item.name,
                }));

                // Insert in chunks of 100
                for (let j = 0; j < values.length; j += 100) {
                    const chunk = values.slice(j, j + 100);
                    await db.insert(villages).values(chunk).onConflictDoNothing();
                }
            }

            if ((i + 1) % 100 === 0 || i === allDistricts.length - 1) {
                process.stdout.write(`   Progress: ${i + 1}/${allDistricts.length} districts (${total} villages)\r`);
            }
        } catch (error) {
            errors++;
        }
    }
    console.log(`\n   ✅ ${total} villages seeded (${errors} files not found)`);
}

async function main() {
    console.log('🌏 Starting Indonesian Region Data Seeder (LOCAL)\n');
    console.log(`📁 Data path: ${DATA_PATH}\n`);
    console.log('━'.repeat(50));

    // Check if data path exists
    if (!fs.existsSync(DATA_PATH)) {
        console.error(`❌ Data path not found: ${DATA_PATH}`);
        console.error('   Please make sure the path is correct.');
        process.exit(1);
    }

    try {
        const provincesData = await seedProvinces();
        await seedRegencies(provincesData);
        await seedDistricts();
        await seedVillages();

        console.log('━'.repeat(50));
        console.log('\n✅ All region data seeded successfully!');

        // Print summary
        console.log('\n📊 Summary:');
        console.log(`   Provinces:  ${(await db.select().from(provinces)).length}`);
        console.log(`   Regencies:  ${(await db.select().from(regencies)).length}`);
        console.log(`   Districts:  ${(await db.select().from(districts)).length}`);
        console.log(`   Villages:   ${(await db.select().from(villages)).length}`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

main();
