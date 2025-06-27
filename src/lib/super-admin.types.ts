export interface SuperAdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'school_admin' | 'student';
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface SchoolApproval {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  admin_user_id: string;
  admin_email: string;
  admin_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  subscription_plan?: string;
  monthly_fee?: number;
  student_count: number;
  total_revenue: number;
}

export interface SystemTransaction {
  id: string;
  school_id: string;
  school_name: string;
  student_id: string;
  student_name: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_type: 'fee_payment' | 'subscription' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_date: string;
  gateway_transaction_id?: string;
  fees_collected: number;
  platform_commission: number;
}

export interface SystemAnalytics {
  totalSchools: number;
  activeSchools: number;
  pendingApprovals: number;
  totalStudents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  platformCommission: number;
  transactionVolume: number;
  averageTransactionValue: number;
  topPerformingSchools: Array<{
    id: string;
    name: string;
    revenue: number;
    studentCount: number;
    growthRate: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  paymentMethodDistribution: Array<{
    method: string;
    percentage: number;
    amount: number;
  }>;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource_type: 'school' | 'user' | 'transaction' | 'system';
  resource_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface SystemConfiguration {
  id: string;
  key: string;
  value: string;
  description: string;
  category: 'payment' | 'security' | 'features' | 'limits';
  is_public: boolean;
  updated_by: string;
  updated_at: string;
}

export interface RefundRequest {
  id: string;
  transaction_id: string;
  school_id: string;
  school_name: string;
  student_id: string;
  student_name: string;
  original_amount: number;
  refund_amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requested_by: string;
  requested_at: string;
  processed_by?: string;
  processed_at?: string;
  notes?: string;
}

export interface SuperAdminResponse<T> {
  data?: T;
  error?: string;
}

export interface SuperAdminListResponse<T> {
  data?: T[];
  hasMore: boolean;
  totalRecords: number;
  error?: string;
}