import { db } from './index';
import { sql } from 'drizzle-orm';

/**
 * Setup Drizzle to work with existing Supabase database
 */
export async function setupDrizzleWithSupabase() {
  console.log('🔧 Setting up Drizzle with existing Supabase database...');

  try {
    // Create Drizzle migrations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
    `);

    // Verify connection and existing tables
    const tableCheck = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'schools', 'departments', 'specialties', 
        'student_enrollments', 'payment_plans', 'fee_payments',
        'super_admin_users', 'audit_logs'
      );
    `);

    const existingTables = tableCheck.rows.map(row => row.table_name);
    console.log('✅ Found existing tables:', existingTables);

    // Add mobile money specific columns if they don't exist
    await db.execute(sql`
      DO $$ 
      BEGIN
        -- Add gateway_provider column to fee_payments if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'fee_payments' AND column_name = 'gateway_provider'
        ) THEN
          ALTER TABLE fee_payments ADD COLUMN gateway_provider text;
        END IF;

        -- Add gateway_transaction_id column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'fee_payments' AND column_name = 'gateway_transaction_id'
        ) THEN
          ALTER TABLE fee_payments ADD COLUMN gateway_transaction_id text;
        END IF;
      END $$;
    `);

    console.log('✅ Drizzle setup completed successfully!');
    console.log('🎉 Ready to use Drizzle ORM with your existing Supabase data!');

    return { success: true, tables: existingTables };

  } catch (error) {
    console.error('❌ Error setting up Drizzle:', error);
    throw error;
  }
}