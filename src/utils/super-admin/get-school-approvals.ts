'use server';

import { createClient } from '@/utils/supabase/server';
import { SchoolApproval, SuperAdminListResponse, SuperAdminResponse } from '@/lib/super-admin.types';

export async function getSchoolApprovals(status?: string): Promise<SuperAdminListResponse<SchoolApproval>> {
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
      .from('school_approvals')
      .select(`
        *,
        school:schools(
          id,
          name,
          is_active
        )
      `)
      .order('submitted_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: approvals, error } = await query;

    if (error) {
      console.error('Error fetching school approvals:', error);
      return { data: [], hasMore: false, totalRecords: 0, error: 'Failed to fetch approvals' };
    }

    // Get additional metrics for each school
    const enrichedApprovals = await Promise.all(
      (approvals || []).map(async (approval) => {
        if (approval.school?.id) {
          // Get student count and revenue
          const { data: metrics } = await supabase
            .from('school_analytics')
            .select('student_count, total_revenue')
            .eq('id', approval.school.id)
            .single();

          return {
            ...approval,
            student_count: metrics?.student_count || 0,
            total_revenue: metrics?.total_revenue || 0
          };
        }
        return {
          ...approval,
          student_count: 0,
          total_revenue: 0
        };
      })
    );

    return {
      data: enrichedApprovals,
      hasMore: false,
      totalRecords: enrichedApprovals.length,
    };

  } catch (error) {
    console.error('Error in getSchoolApprovals:', error);
    return { data: [], hasMore: false, totalRecords: 0, error: 'Something went wrong' };
  }
}

export async function approveSchool(approvalId: string): Promise<SuperAdminResponse<boolean>> {
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

    // Update approval status
    const { error: updateError } = await supabase
      .from('school_approvals')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: superAdmin.id
      })
      .eq('id', approvalId);

    if (updateError) {
      return { error: 'Failed to approve school' };
    }

    // Activate the school
    const { data: approval } = await supabase
      .from('school_approvals')
      .select('school_id')
      .eq('id', approvalId)
      .single();

    if (approval?.school_id) {
      await supabase
        .from('schools')
        .update({ is_active: true })
        .eq('id', approval.school_id);
    }

    return { data: true };

  } catch (error) {
    console.error('Error approving school:', error);
    return { error: 'Failed to approve school' };
  }
}

export async function rejectSchool(approvalId: string, reason: string): Promise<SuperAdminResponse<boolean>> {
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

    const { error: updateError } = await supabase
      .from('school_approvals')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: superAdmin.id,
        rejection_reason: reason
      })
      .eq('id', approvalId);

    if (updateError) {
      return { error: 'Failed to reject school' };
    }

    return { data: true };

  } catch (error) {
    console.error('Error rejecting school:', error);
    return { error: 'Failed to reject school' };
  }
}

export async function suspendSchool(schoolId: string, reason: string): Promise<SuperAdminResponse<boolean>> {
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

    // Suspend the school
    const { error: updateError } = await supabase
      .from('schools')
      .update({ is_active: false })
      .eq('id', schoolId);

    if (updateError) {
      return { error: 'Failed to suspend school' };
    }

    // Update approval record
    await supabase
      .from('school_approvals')
      .update({
        status: 'suspended',
        reviewed_at: new Date().toISOString(),
        reviewed_by: superAdmin.id,
        rejection_reason: reason
      })
      .eq('school_id', schoolId);

    return { data: true };

  } catch (error) {
    console.error('Error suspending school:', error);
    return { error: 'Failed to suspend school' };
  }
}