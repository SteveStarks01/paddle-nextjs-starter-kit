'use server';

import { createClient } from '@/utils/supabase/server';
import { SchoolFeeListResponse } from '@/lib/school-fee.types';
import { Department } from '@/lib/school-fee.types';

export async function getDepartmentsBySchool(schoolId: string): Promise<SchoolFeeListResponse<Department>> {
  try {
    const supabase = await createClient();
    
    const { data: departments, error } = await supabase
      .from('departments')
      .select(`
        *,
        school:schools(*)
      `)
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching departments:', error);
      return { data: [], hasMore: false, totalRecords: 0, error: 'Failed to fetch departments' };
    }

    return {
      data: departments || [],
      hasMore: false,
      totalRecords: departments?.length || 0,
    };
  } catch (error) {
    console.error('Error in getDepartmentsBySchool:', error);
    return { data: [], hasMore: false, totalRecords: 0, error: 'Something went wrong' };
  }
}

export async function getMyDepartments(): Promise<SchoolFeeListResponse<Department>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: [], hasMore: false, totalRecords: 0, error: 'Not authenticated' };
    }

    const { data: departments, error } = await supabase
      .from('departments')
      .select(`
        *,
        school:schools(*)
      `)
      .eq('school.admin_user_id', user.id)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching my departments:', error);
      return { data: [], hasMore: false, totalRecords: 0, error: 'Failed to fetch departments' };
    }

    return {
      data: departments || [],
      hasMore: false,
      totalRecords: departments?.length || 0,
    };
  } catch (error) {
    console.error('Error in getMyDepartments:', error);
    return { data: [], hasMore: false, totalRecords: 0, error: 'Something went wrong' };
  }
}