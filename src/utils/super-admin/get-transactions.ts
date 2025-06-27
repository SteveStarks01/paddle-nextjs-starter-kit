'use server';

import { createClient } from '@/utils/supabase/server';
import { SystemTransaction, SuperAdminListResponse } from '@/lib/super-admin.types';

export async function getSystemTransactions(
  filters?: {
    status?: string;
    schoolId?: string;
    dateFrom?: string;
    dateTo?: string;
    transactionType?: string;
  },
  page: number = 1,
  limit: number = 50
): Promise<SuperAdminListResponse<SystemTransaction>> {
  try {
    const supabase = await createClient();
    
    // Verify super admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: [], hasMore: false, totalRecords: 0, error: 'Not authenticated' };
    }

    const { data: superAdmin } = await supabase
      .from('super_admin_users')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!superAdmin) {
      return { data: [], hasMore: false, totalRecords: 0, error: 'Unauthorized' };
    }

    let query = supabase
      .from('system_transactions')
      .select(`
        *,
        school:schools(name),
        student_enrollment:student_enrollments(
          first_name,
          last_name,
          student_id
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.schoolId) {
      query = query.eq('school_id', filters.schoolId);
    }
    if (filters?.transactionType) {
      query = query.eq('transaction_type', filters.transactionType);
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: transactions, error, count } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      return { data: [], hasMore: false, totalRecords: 0, error: 'Failed to fetch transactions' };
    }

    const enrichedTransactions = (transactions || []).map(transaction => ({
      id: transaction.id,
      school_id: transaction.school_id,
      school_name: transaction.school?.name || 'Unknown School',
      student_id: transaction.student_enrollment?.student_id || '',
      student_name: transaction.student_enrollment 
        ? `${transaction.student_enrollment.first_name} ${transaction.student_enrollment.last_name}`
        : '',
      amount: transaction.amount,
      currency: transaction.currency,
      payment_method: transaction.payment_method,
      transaction_type: transaction.transaction_type,
      status: transaction.status,
      payment_date: transaction.created_at,
      gateway_transaction_id: transaction.gateway_transaction_id,
      fees_collected: transaction.school_amount,
      platform_commission: transaction.platform_fee
    }));

    return {
      data: enrichedTransactions,
      hasMore: (count || 0) > offset + limit,
      totalRecords: count || 0,
    };

  } catch (error) {
    console.error('Error in getSystemTransactions:', error);
    return { data: [], hasMore: false, totalRecords: 0, error: 'Something went wrong' };
  }
}

export async function getTransactionDetails(transactionId: string) {
  try {
    const supabase = await createClient();
    
    const { data: transaction, error } = await supabase
      .from('system_transactions')
      .select(`
        *,
        school:schools(*),
        student_enrollment:student_enrollments(*),
        payment_plan:payment_plans(*)
      `)
      .eq('id', transactionId)
      .single();

    if (error || !transaction) {
      return { error: 'Transaction not found' };
    }

    return { data: transaction };

  } catch (error) {
    console.error('Error fetching transaction details:', error);
    return { error: 'Failed to fetch transaction details' };
  }
}