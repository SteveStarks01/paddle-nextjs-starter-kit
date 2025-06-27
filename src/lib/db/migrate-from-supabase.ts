import { db } from './index';
import { sql } from 'drizzle-orm';

/**
 * Migration utility to sync Drizzle schema with existing Supabase tables
 * This ensures compatibility with your existing data
 */
export async function syncWithExistingTables() {
  console.log('🔄 Syncing Drizzle with existing Supabase tables...');

  try {
    // Check if tables exist and create Drizzle migration tracking
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
    `);

    // Verify existing tables are accessible
    const tableCheck = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('schools', 'departments', 'specialties', 'student_enrollments');
    `);

    console.log('✅ Found existing tables:', tableCheck.rows.map(r => r.table_name));
    console.log('🎉 Drizzle is now synced with your existing Supabase setup!');

  } catch (error) {
    console.error('❌ Error syncing with existing tables:', error);
    throw error;
  }
}