export interface School {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  admin_user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  school_id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  school?: School;
}

export interface Specialty {
  id: string;
  department_id: string;
  name: string;
  code: string;
  description?: string;
  duration_years: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department?: Department;
}

export interface FeeStructure {
  id: string;
  specialty_id: string;
  academic_year: string;
  total_amount: number;
  currency: string;
  allows_installments: boolean;
  max_installments: number;
  late_fee_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  specialty?: Specialty;
}

export interface StudentEnrollment {
  id: string;
  student_user_id: string;
  specialty_id: string;
  fee_structure_id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  enrollment_date: string;
  academic_year: string;
  status: 'active' | 'suspended' | 'graduated' | 'withdrawn';
  created_at: string;
  updated_at: string;
  specialty?: Specialty;
  fee_structure?: FeeStructure;
}

export interface PaymentPlan {
  id: string;
  enrollment_id: string;
  plan_type: 'full' | 'installment';
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  number_of_installments: number;
  installment_amount?: number;
  due_date?: string;
  status: 'active' | 'completed' | 'overdue' | 'cancelled';
  created_at: string;
  updated_at: string;
  enrollment?: StudentEnrollment;
}

export interface PaymentSchedule {
  id: string;
  payment_plan_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  late_fee: number;
  created_at: string;
  updated_at: string;
  payment_plan?: PaymentPlan;
}

export interface FeePayment {
  id: string;
  payment_plan_id: string;
  payment_schedule_id?: string;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  payment_date: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  receipt_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  payment_plan?: PaymentPlan;
  payment_schedule?: PaymentSchedule;
}

export interface SchoolFeeResponse<T> {
  data?: T;
  error?: string;
}

export interface SchoolFeeListResponse<T> {
  data?: T[];
  hasMore: boolean;
  totalRecords: number;
  error?: string;
}