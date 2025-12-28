import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

// PostgreSQL connection
const connectionString = process.env.DATABASE_URL!;

// For query execution
const queryClient = postgres(connectionString);

// Drizzle ORM instance
export const db = drizzle(queryClient, { schema });

// For migrations (uses a different connection mode)
export const createMigrationClient = () => {
    return postgres(connectionString, { max: 1 });
};

export default db;
