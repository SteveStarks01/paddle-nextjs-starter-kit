'use server';

import { createClient } from '@/utils/supabase/server';
import { SystemAnalytics, SuperAdminResponse } from '@/lib/super-admin.types';

export async function getSystemAnalytics(): Promise<SuperAdminResponse<SystemAnalytics>> {
  try {
    const supabase = await createClient();
    
    // Verify super admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { data: superAdmin } = await supabase
      .from('super_admin_users')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!superAdmin) {
      return { error: 'Unauthorized - Super admin access required' };
    }

    // Get platform analytics
    const { data: platformData } = await supabase
      .from('platform_analytics')
      .select('*')
      .single();

    // Get top performing schools
    const { data: topSchools } = await supabase
      .from('school_analytics')
      .select('*')
      .order('total_revenue', { ascending: false })
      .limit(5);

    // Get revenue by month (last 12 months)
    const { data: monthlyRevenue } = await supabase
      .rpc('get_monthly_revenue', { months: 12 });

    // Get payment method distribution
    const { data: paymentMethods } = await supabase
      .from('system_transactions')
      .select('payment_method, amount')
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Process payment method distribution
    const paymentMethodMap = new Map();
    let totalAmount = 0;

    paymentMethods?.forEach(transaction => {
      const method = transaction.payment_method || 'Unknown';
      const amount = parseFloat(transaction.amount);
      paymentMethodMap.set(method, (paymentMethodMap.get(method) || 0) + amount);
      totalAmount += amount;
    });

    const paymentMethodDistribution = Array.from(paymentMethodMap.entries()).map(([method, amount]) => ({
      method,
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
    }));

    const analytics: SystemAnalytics = {
      totalSchools: platformData?.total_schools || 0,
      activeSchools: platformData?.active_schools || 0,
      pendingApprovals: platformData?.pending_approvals || 0,
      totalStudents: platformData?.total_students || 0,
      totalRevenue: platformData?.total_revenue || 0,
      monthlyRevenue: platformData?.monthly_revenue || 0,
      platformCommission: platformData?.platform_commission || 0,
      transactionVolume: platformData?.transaction_count || 0,
      averageTransactionValue: platformData?.avg_transaction_value || 0,
      topPerformingSchools: topSchools?.map(school => ({
        id: school.id,
        name: school.name,
        revenue: school.total_revenue || 0,
        studentCount: school.student_count || 0,
        growthRate: 0 // Calculate growth rate based on historical data
      })) || [],
      revenueByMonth: monthlyRevenue || [],
      paymentMethodDistribution
    };

    return { data: analytics };

  } catch (error) {
    console.error('Error fetching system analytics:', error);
    return { error: 'Failed to fetch analytics data' };
  }
}

export async function getSchoolPerformanceMetrics(schoolId: string): Promise<SuperAdminResponse<any>> {
  try {
    const supabase = await createClient();
    
    const { data: schoolMetrics } = await supabase
      .from('school_analytics')
      .select('*')
      .eq('id', schoolId)
      .single();

    if (!schoolMetrics) {
      return { error: 'School not found' };
    }

    // Get monthly performance for the school
    const { data: monthlyPerformance } = await supabase
      .from('system_transactions')
      .select('created_at, amount')
      .eq('school_id', schoolId)
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at');

    return { 
      data: {
        ...schoolMetrics,
        monthlyPerformance
      }
    };

  } catch (error) {
    console.error('Error fetching school performance:', error);
    return { error: 'Failed to fetch school performance data' };
  }
}