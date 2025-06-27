-- Initial setup migration for Drizzle compatibility with existing Supabase tables
-- This ensures Drizzle can work with your existing schema

-- Create Drizzle migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS drizzle_migrations (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
);

-- Verify existing tables are accessible and add any missing indexes
CREATE INDEX IF NOT EXISTS idx_schools_admin_user_id ON schools(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_departments_school_id ON departments(school_id);
CREATE INDEX IF NOT EXISTS idx_specialties_department_id ON specialties(department_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_student_user_id ON student_enrollments(student_user_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_enrollment_id ON payment_plans(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_payment_plan_id ON fee_payments(payment_plan_id);

-- Add any missing columns for mobile money integration
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