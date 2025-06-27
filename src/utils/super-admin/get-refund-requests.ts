'use server';

import { createClient } from '@/utils/supabase/server';
import { RefundRequest, SuperAdminListResponse, SuperAdminResponse } from '@/lib/super-admin.types';

export async function getRefundRequests(status?: string): Promise<SuperAdminListResponse<RefundRequest>> {
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
      .from('refund_requests')
      .select(`
        *,
        school:schools(name),
        student_enrollment:student_enrollments(
          first_name,
          last_name,
          student_id
        ),
        transaction:system_transactions(*)
      `)
      .order('requested_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: refunds, error } = await query;

    if (error) {
      console.error('Error fetching refund requests:', error);
      return { data: [], hasMore: false, totalRecords: 0, error: 'Failed to fetch refund requests' };
    }

    const refundRequests = (refunds || []).map(refund => ({
      id: refund.id,
      transaction_id: refund.transaction_id,
      school_id: refund.school_id,
      school_name: refund.school?.name || 'Unknown School',
      student_id: refund.student_enrollment?.student_id || '',
      student_name: refund.student_enrollment 
        ? `${refund.student_enrollment.first_name} ${refund.student_enrollment.last_name}`
        : '',
      original_amount: refund.original_amount,
      refund_amount: refund.refund_amount,
      reason: refund.reason,
      status: refund.status,
      requested_by: refund.requested_by,
      requested_at: refund.requested_at,
      processed_by: refund.processed_by,
      processed_at: refund.processed_at,
      notes: refund.notes
    }));

    return {
      data: refundRequests,
      hasMore: false,
      totalRecords: refundRequests.length,
    };

  } catch (error) {
    console.error('Error in getRefundRequests:', error);
    return { data: [], hasMore: false, totalRecords: 0, error: 'Something went wrong' };
  }
}

export async function processRefundRequest(
  refundId: string, 
  action: 'approve' | 'reject', 
  notes?: string
): Promise<SuperAdminResponse<boolean>> {
  try {
    const supabase = await createClient();
    
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
      return { error: 'Unauthorized' };
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    
    const { error: updateError } = await supabase
      .from('refund_requests')
      .update({
        status,
        reviewed_by: superAdmin.id,
        reviewed_at: new Date().toISOString(),
        notes
      })
      .eq('id', refundId);

    if (updateError) {
      return { error: `Failed to ${action} refund request` };
    }

    // If approved, you would typically integrate with payment processor here
    // to actually process the refund

    return { data: true };

  } catch (error) {
    console.error(`Error ${action}ing refund request:`, error);
    return { error: `Failed to ${action} refund request` };
  }
}