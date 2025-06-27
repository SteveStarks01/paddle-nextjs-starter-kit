import { db } from './index';
import { sql } from 'drizzle-orm';

/**
 * Complete database setup for the school fee platform
 */
export async function setupDatabase() {
  console.log('🚀 Setting up School Fee Platform Database...');

  try {
    // 1. Verify Supabase connection
    console.log('📡 Testing Supabase connection...');
    await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Supabase connection successful');

    // 2. Setup Drizzle migrations table
    console.log('🔧 Setting up Drizzle migrations...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
    `);

    // 3. Verify existing tables from Supabase migrations
    console.log('🔍 Checking existing tables...');
    const tableCheck = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'schools', 'departments', 'specialties', 
        'student_enrollments', 'payment_plans', 'fee_payments',
        'super_admin_users', 'audit_logs', 'system_transactions',
        'customers', 'subscriptions'
      )
      ORDER BY table_name;
    `);

    const existingTables = tableCheck.rows.map(row => row.table_name);
    console.log('📋 Found existing tables:', existingTables);

    // 4. Add mobile money enhancements
    console.log('📱 Adding mobile money enhancements...');
    await db.execute(sql`
      DO $$ 
      BEGIN
        -- Add mobile money columns to fee_payments if they don't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'fee_payments' AND column_name = 'gateway_provider'
        ) THEN
          ALTER TABLE fee_payments ADD COLUMN gateway_provider text;
          ALTER TABLE fee_payments ADD COLUMN gateway_transaction_id text;
          ALTER TABLE fee_payments ADD COLUMN phone_number text;
        END IF;

        -- Create mobile money transactions table if it doesn't exist
        CREATE TABLE IF NOT EXISTS mobile_money_transactions (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          fee_payment_id uuid REFERENCES fee_payments(id),
          gateway_provider text NOT NULL,
          gateway_transaction_id text NOT NULL,
          phone_number text NOT NULL,
          amount decimal(10,2) NOT NULL,
          currency text NOT NULL,
          status text NOT NULL DEFAULT 'pending',
          gateway_response text,
          webhook_received boolean DEFAULT false,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );

        -- Add indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_mobile_money_gateway_tx_id 
          ON mobile_money_transactions(gateway_transaction_id);
        CREATE INDEX IF NOT EXISTS idx_mobile_money_status 
          ON mobile_money_transactions(status);
        CREATE INDEX IF NOT EXISTS idx_fee_payments_gateway_tx_id 
          ON fee_payments(gateway_transaction_id);
      END $$;
    `);

    // 5. Verify table counts
    console.log('📊 Getting table statistics...');
    const stats = await db.execute(sql`
      SELECT 
        'schools' as table_name, COUNT(*) as count FROM schools
      UNION ALL
      SELECT 
        'departments' as table_name, COUNT(*) as count FROM departments
      UNION ALL
      SELECT 
        'specialties' as table_name, COUNT(*) as count FROM specialties
      UNION ALL
      SELECT 
        'student_enrollments' as table_name, COUNT(*) as count FROM student_enrollments
      UNION ALL
      SELECT 
        'payment_plans' as table_name, COUNT(*) as count FROM payment_plans
      UNION ALL
      SELECT 
        'fee_payments' as table_name, COUNT(*) as count FROM fee_payments;
    `);

    console.log('📈 Table Statistics:');
    stats.rows.forEach(row => {
      console.log(`   ${row.table_name}: ${row.count} records`);
    });

    console.log('🎉 Database setup completed successfully!');
    return { 
      success: true, 
      tables: existingTables,
      stats: stats.rows 
    };

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

/**
 * Health check for the database
 */
export async function healthCheck() {
  try {
    await db.execute(sql`SELECT 1`);
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date() 
    };
  }
}