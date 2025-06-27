/*
  # School Fee Payment Platform Database Schema

  1. New Tables
    - `schools` - Store school information and configuration
    - `departments` - Academic departments within schools
    - `specialties` - Specializations within departments
    - `fee_structures` - Fee configurations for different programs
    - `student_enrollments` - Student enrollment records
    - `payment_plans` - Payment plan configurations
    - `fee_payments` - Individual payment records
    - `payment_schedules` - Installment schedules

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for schools, students, and admins

  3. Relationships
    - Schools -> Departments -> Specialties
    - Fee structures linked to specialties
    - Students enrolled in specialties
    - Payments linked to enrollments
*/

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  address text,
  phone text,
  email text,
  logo_url text,
  admin_user_id uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, code)
);

-- Specialties table
CREATE TABLE IF NOT EXISTS specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  duration_years integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(department_id, code)
);

-- Fee structures table
CREATE TABLE IF NOT EXISTS fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_id uuid NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  academic_year text NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  allows_installments boolean DEFAULT true,
  max_installments integer DEFAULT 4,
  late_fee_percentage decimal(5,2) DEFAULT 5.00,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Student enrollments table
CREATE TABLE IF NOT EXISTS student_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id uuid NOT NULL REFERENCES auth.users(id),
  specialty_id uuid NOT NULL REFERENCES specialties(id),
  fee_structure_id uuid NOT NULL REFERENCES fee_structures(id),
  student_id text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  enrollment_date date DEFAULT CURRENT_DATE,
  academic_year text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'graduated', 'withdrawn')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(specialty_id, student_id, academic_year)
);

-- Payment plans table
CREATE TABLE IF NOT EXISTS payment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('full', 'installment')),
  total_amount decimal(10,2) NOT NULL,
  paid_amount decimal(10,2) DEFAULT 0,
  outstanding_amount decimal(10,2) NOT NULL,
  number_of_installments integer DEFAULT 1,
  installment_amount decimal(10,2),
  due_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment schedules table (for installment plans)
CREATE TABLE IF NOT EXISTS payment_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_plan_id uuid NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
  installment_number integer NOT NULL,
  amount decimal(10,2) NOT NULL,
  due_date date NOT NULL,
  paid_date date,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'waived')),
  late_fee decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fee payments table
CREATE TABLE IF NOT EXISTS fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_plan_id uuid NOT NULL REFERENCES payment_plans(id),
  payment_schedule_id uuid REFERENCES payment_schedules(id),
  amount decimal(10,2) NOT NULL,
  payment_method text NOT NULL,
  transaction_id text,
  payment_date timestamptz DEFAULT now(),
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  receipt_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Schools
CREATE POLICY "School admins can manage their schools"
  ON schools
  FOR ALL
  TO authenticated
  USING (admin_user_id = auth.uid());

CREATE POLICY "Students can view schools"
  ON schools
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for Departments
CREATE POLICY "School admins can manage departments"
  ON departments
  FOR ALL
  TO authenticated
  USING (
    school_id IN (
      SELECT id FROM schools WHERE admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Students can view active departments"
  ON departments
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for Specialties
CREATE POLICY "School admins can manage specialties"
  ON specialties
  FOR ALL
  TO authenticated
  USING (
    department_id IN (
      SELECT d.id FROM departments d
      JOIN schools s ON d.school_id = s.id
      WHERE s.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Students can view active specialties"
  ON specialties
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for Fee Structures
CREATE POLICY "School admins can manage fee structures"
  ON fee_structures
  FOR ALL
  TO authenticated
  USING (
    specialty_id IN (
      SELECT sp.id FROM specialties sp
      JOIN departments d ON sp.department_id = d.id
      JOIN schools s ON d.school_id = s.id
      WHERE s.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Students can view active fee structures"
  ON fee_structures
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for Student Enrollments
CREATE POLICY "Students can manage their own enrollments"
  ON student_enrollments
  FOR ALL
  TO authenticated
  USING (student_user_id = auth.uid());

CREATE POLICY "School admins can view their school enrollments"
  ON student_enrollments
  FOR SELECT
  TO authenticated
  USING (
    specialty_id IN (
      SELECT sp.id FROM specialties sp
      JOIN departments d ON sp.department_id = d.id
      JOIN schools s ON d.school_id = s.id
      WHERE s.admin_user_id = auth.uid()
    )
  );

-- RLS Policies for Payment Plans
CREATE POLICY "Students can manage their payment plans"
  ON payment_plans
  FOR ALL
  TO authenticated
  USING (
    enrollment_id IN (
      SELECT id FROM student_enrollments WHERE student_user_id = auth.uid()
    )
  );

CREATE POLICY "School admins can view payment plans"
  ON payment_plans
  FOR SELECT
  TO authenticated
  USING (
    enrollment_id IN (
      SELECT se.id FROM student_enrollments se
      JOIN specialties sp ON se.specialty_id = sp.id
      JOIN departments d ON sp.department_id = d.id
      JOIN schools s ON d.school_id = s.id
      WHERE s.admin_user_id = auth.uid()
    )
  );

-- RLS Policies for Payment Schedules
CREATE POLICY "Students can view their payment schedules"
  ON payment_schedules
  FOR SELECT
  TO authenticated
  USING (
    payment_plan_id IN (
      SELECT pp.id FROM payment_plans pp
      JOIN student_enrollments se ON pp.enrollment_id = se.id
      WHERE se.student_user_id = auth.uid()
    )
  );

CREATE POLICY "School admins can view payment schedules"
  ON payment_schedules
  FOR SELECT
  TO authenticated
  USING (
    payment_plan_id IN (
      SELECT pp.id FROM payment_plans pp
      JOIN student_enrollments se ON pp.enrollment_id = se.id
      JOIN specialties sp ON se.specialty_id = sp.id
      JOIN departments d ON sp.department_id = d.id
      JOIN schools s ON d.school_id = s.id
      WHERE s.admin_user_id = auth.uid()
    )
  );

-- RLS Policies for Fee Payments
CREATE POLICY "Students can manage their payments"
  ON fee_payments
  FOR ALL
  TO authenticated
  USING (
    payment_plan_id IN (
      SELECT pp.id FROM payment_plans pp
      JOIN student_enrollments se ON pp.enrollment_id = se.id
      WHERE se.student_user_id = auth.uid()
    )
  );

CREATE POLICY "School admins can view payments"
  ON fee_payments
  FOR SELECT
  TO authenticated
  USING (
    payment_plan_id IN (
      SELECT pp.id FROM payment_plans pp
      JOIN student_enrollments se ON pp.enrollment_id = se.id
      JOIN specialties sp ON se.specialty_id = sp.id
      JOIN departments d ON sp.department_id = d.id
      JOIN schools s ON d.school_id = s.id
      WHERE s.admin_user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schools_admin_user_id ON schools(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_departments_school_id ON departments(school_id);
CREATE INDEX IF NOT EXISTS idx_specialties_department_id ON specialties(department_id);
CREATE INDEX IF NOT EXISTS idx_fee_structures_specialty_id ON fee_structures(specialty_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_student_user_id ON student_enrollments(student_user_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_specialty_id ON student_enrollments(specialty_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_enrollment_id ON payment_plans(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_payment_plan_id ON payment_schedules(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_payment_plan_id ON fee_payments(payment_plan_id);