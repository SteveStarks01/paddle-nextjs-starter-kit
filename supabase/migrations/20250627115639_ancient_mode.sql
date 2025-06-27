/*
  # Super Admin System Setup

  1. New Tables
    - `super_admin_users` - Super admin user management
    - `school_approvals` - School registration approval workflow
    - `system_transactions` - All platform transactions
    - `audit_logs` - System activity tracking
    - `system_configurations` - Platform settings
    - `refund_requests` - Payment refund management
    - `subscription_plans` - School subscription tiers

  2. Security
    - Enable RLS on all tables
    - Add policies for super admin access
    - Add audit logging triggers

  3. Analytics Views
    - Create materialized views for analytics
    - Add performance indexes
*/

-- Super admin users table
CREATE TABLE IF NOT EXISTS super_admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  role text DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'admin', 'analyst')),
  permissions jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- School approvals table
CREATE TABLE IF NOT EXISTS school_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  address text,
  phone text,
  email text,
  logo_url text,
  admin_user_id uuid REFERENCES auth.users(id),
  admin_email text NOT NULL,
  admin_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES super_admin_users(id),
  rejection_reason text,
  subscription_plan text DEFAULT 'basic',
  monthly_fee decimal(10,2) DEFAULT 0,
  documents jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- System transactions table
CREATE TABLE IF NOT EXISTS system_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id),
  student_enrollment_id uuid REFERENCES student_enrollments(id),
  payment_plan_id uuid REFERENCES payment_plans(id),
  transaction_type text NOT NULL CHECK (transaction_type IN ('fee_payment', 'subscription', 'refund', 'commission')),
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_method text,
  gateway_provider text,
  gateway_transaction_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed')),
  platform_fee decimal(10,2) DEFAULT 0,
  school_amount decimal(10,2) NOT NULL,
  metadata jsonb DEFAULT '{}',
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- System configurations table
CREATE TABLE IF NOT EXISTS system_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  category text DEFAULT 'general' CHECK (category IN ('payment', 'security', 'features', 'limits', 'general')),
  data_type text DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
  is_public boolean DEFAULT false,
  is_encrypted boolean DEFAULT false,
  updated_by uuid REFERENCES super_admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Refund requests table
CREATE TABLE IF NOT EXISTS refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES system_transactions(id),
  school_id uuid REFERENCES schools(id),
  student_enrollment_id uuid REFERENCES student_enrollments(id),
  original_amount decimal(10,2) NOT NULL,
  refund_amount decimal(10,2) NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  requested_by uuid REFERENCES auth.users(id),
  requested_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES super_admin_users(id),
  reviewed_at timestamptz,
  processed_by uuid REFERENCES super_admin_users(id),
  processed_at timestamptz,
  notes text,
  refund_transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  monthly_price decimal(10,2) NOT NULL,
  annual_price decimal(10,2),
  max_students integer,
  max_departments integer,
  features jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE super_admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Super Admin Users
CREATE POLICY "Super admins can manage super admin users"
  ON super_admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users sau
      WHERE sau.user_id = auth.uid() AND sau.is_active = true
    )
  );

-- RLS Policies for School Approvals
CREATE POLICY "Super admins can manage school approvals"
  ON school_approvals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users sau
      WHERE sau.user_id = auth.uid() AND sau.is_active = true
    )
  );

CREATE POLICY "School admins can view their approval status"
  ON school_approvals
  FOR SELECT
  TO authenticated
  USING (admin_user_id = auth.uid());

-- RLS Policies for System Transactions
CREATE POLICY "Super admins can view all transactions"
  ON system_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users sau
      WHERE sau.user_id = auth.uid() AND sau.is_active = true
    )
  );

CREATE POLICY "School admins can view their school transactions"
  ON system_transactions
  FOR SELECT
  TO authenticated
  USING (
    school_id IN (
      SELECT id FROM schools WHERE admin_user_id = auth.uid()
    )
  );

-- RLS Policies for Audit Logs
CREATE POLICY "Super admins can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users sau
      WHERE sau.user_id = auth.uid() AND sau.is_active = true
    )
  );

-- RLS Policies for System Configurations
CREATE POLICY "Super admins can manage system configurations"
  ON system_configurations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users sau
      WHERE sau.user_id = auth.uid() AND sau.is_active = true
    )
  );

CREATE POLICY "Public configurations are readable by authenticated users"
  ON system_configurations
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- RLS Policies for Refund Requests
CREATE POLICY "Super admins can manage refund requests"
  ON refund_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users sau
      WHERE sau.user_id = auth.uid() AND sau.is_active = true
    )
  );

CREATE POLICY "School admins can view their refund requests"
  ON refund_requests
  FOR SELECT
  TO authenticated
  USING (
    school_id IN (
      SELECT id FROM schools WHERE admin_user_id = auth.uid()
    )
  );

-- RLS Policies for Subscription Plans
CREATE POLICY "Everyone can view active subscription plans"
  ON subscription_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Super admins can manage subscription plans"
  ON subscription_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users sau
      WHERE sau.user_id = auth.uid() AND sau.is_active = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_super_admin_users_user_id ON super_admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_super_admin_users_email ON super_admin_users(email);
CREATE INDEX IF NOT EXISTS idx_school_approvals_status ON school_approvals(status);
CREATE INDEX IF NOT EXISTS idx_school_approvals_submitted_at ON school_approvals(submitted_at);
CREATE INDEX IF NOT EXISTS idx_system_transactions_school_id ON system_transactions(school_id);
CREATE INDEX IF NOT EXISTS idx_system_transactions_status ON system_transactions(status);
CREATE INDEX IF NOT EXISTS idx_system_transactions_created_at ON system_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_school_id ON refund_requests(school_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, monthly_price, annual_price, max_students, max_departments, features) VALUES
('Basic', 'Perfect for small schools', 99.00, 990.00, 500, 5, '["Basic reporting", "Email support", "Standard features"]'),
('Professional', 'Ideal for growing institutions', 199.00, 1990.00, 2000, 15, '["Advanced reporting", "Priority support", "Custom branding", "API access"]'),
('Enterprise', 'For large educational institutions', 499.00, 4990.00, null, null, '["Unlimited students", "Unlimited departments", "24/7 support", "Custom integrations", "Dedicated account manager"]')
ON CONFLICT (name) DO NOTHING;

-- Insert default system configurations
INSERT INTO system_configurations (key, value, description, category, data_type, is_public) VALUES
('platform_commission_rate', '2.5', 'Platform commission rate as percentage', 'payment', 'number', false),
('max_refund_days', '30', 'Maximum days allowed for refund requests', 'payment', 'number', true),
('min_transaction_amount', '1.00', 'Minimum transaction amount allowed', 'payment', 'number', true),
('max_transaction_amount', '50000.00', 'Maximum transaction amount allowed', 'payment', 'number', true),
('auto_approve_schools', 'false', 'Automatically approve school registrations', 'features', 'boolean', false),
('require_school_verification', 'true', 'Require document verification for schools', 'security', 'boolean', false),
('session_timeout_minutes', '60', 'User session timeout in minutes', 'security', 'number', false),
('max_login_attempts', '5', 'Maximum login attempts before lockout', 'security', 'number', false)
ON CONFLICT (key) DO NOTHING;

-- Create audit logging function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, new_values)
    VALUES (
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id::text,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, old_values, new_values)
    VALUES (
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id::text,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, old_values)
    VALUES (
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      TG_OP,
      TG_TABLE_NAME,
      OLD.id::text,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for important tables
CREATE TRIGGER audit_schools_trigger
  AFTER INSERT OR UPDATE OR DELETE ON schools
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_school_approvals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON school_approvals
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_system_transactions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON system_transactions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_refund_requests_trigger
  AFTER INSERT OR UPDATE OR DELETE ON refund_requests
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create analytics views
CREATE OR REPLACE VIEW school_analytics AS
SELECT 
  s.id,
  s.name,
  s.code,
  s.created_at,
  COUNT(DISTINCT se.id) as student_count,
  COUNT(DISTINCT d.id) as department_count,
  COALESCE(SUM(st.school_amount), 0) as total_revenue,
  COALESCE(SUM(CASE WHEN st.created_at >= date_trunc('month', CURRENT_DATE) THEN st.school_amount ELSE 0 END), 0) as monthly_revenue,
  COALESCE(AVG(st.school_amount), 0) as avg_transaction_value
FROM schools s
LEFT JOIN departments d ON s.id = d.school_id AND d.is_active = true
LEFT JOIN specialties sp ON d.id = sp.department_id AND sp.is_active = true
LEFT JOIN student_enrollments se ON sp.id = se.specialty_id AND se.status = 'active'
LEFT JOIN system_transactions st ON s.id = st.school_id AND st.status = 'completed'
WHERE s.is_active = true
GROUP BY s.id, s.name, s.code, s.created_at;

CREATE OR REPLACE VIEW platform_analytics AS
SELECT 
  COUNT(DISTINCT s.id) as total_schools,
  COUNT(DISTINCT CASE WHEN s.is_active = true THEN s.id END) as active_schools,
  COUNT(DISTINCT sa.id) as pending_approvals,
  COUNT(DISTINCT se.id) as total_students,
  COALESCE(SUM(st.amount), 0) as total_revenue,
  COALESCE(SUM(st.platform_fee), 0) as platform_commission,
  COALESCE(SUM(CASE WHEN st.created_at >= date_trunc('month', CURRENT_DATE) THEN st.amount ELSE 0 END), 0) as monthly_revenue,
  COUNT(DISTINCT st.id) as transaction_count,
  COALESCE(AVG(st.amount), 0) as avg_transaction_value
FROM schools s
LEFT JOIN school_approvals sa ON sa.status = 'pending'
LEFT JOIN departments d ON s.id = d.school_id
LEFT JOIN specialties sp ON d.id = sp.department_id
LEFT JOIN student_enrollments se ON sp.id = se.specialty_id
LEFT JOIN system_transactions st ON s.id = st.school_id AND st.status = 'completed';