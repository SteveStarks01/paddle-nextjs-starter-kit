import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create the connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });

// Create the database instance
export const db = drizzle(client, { schema });

// Export types
export type Database = typeof db;
export * from './schema';