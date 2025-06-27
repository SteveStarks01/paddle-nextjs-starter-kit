'use server';

import { createClient } from '@/utils/supabase/server';
import { AuditLog, SuperAdminListResponse } from '@/lib/super-admin.types';

export async function getAuditLogs(
  filters?: {
    userId?: string;
    action?: string;
    resourceType?: string;
    dateFrom?: string;
    dateTo?: string;
  },
  page: number = 1,
  limit: number = 50
): Promise<SuperAdminListResponse<AuditLog>> {
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
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.resourceType) {
      query = query.eq('resource_type', filters.resourceType);
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

    const { data: logs, error, count } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return { data: [], hasMore: false, totalRecords: 0, error: 'Failed to fetch audit logs' };
    }

    const auditLogs = (logs || []).map(log => ({
      id: log.id,
      user_id: log.user_id,
      user_email: log.user_email,
      action: log.action,
      resource_type: log.resource_type,
      resource_id: log.resource_id,
      details: {
        old_values: log.old_values,
        new_values: log.new_values,
        ip_address: log.ip_address,
        user_agent: log.user_agent
      },
      ip_address: log.ip_address,
      user_agent: log.user_agent,
      timestamp: log.created_at
    }));

    return {
      data: auditLogs,
      hasMore: (count || 0) > offset + limit,
      totalRecords: count || 0,
    };

  } catch (error) {
    console.error('Error in getAuditLogs:', error);
    return { data: [], hasMore: false, totalRecords: 0, error: 'Something went wrong' };
  }
}