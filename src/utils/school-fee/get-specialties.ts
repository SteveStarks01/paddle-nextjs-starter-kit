'use server';

import { createClient } from '@/utils/supabase/server';
import { SchoolFeeListResponse } from '@/lib/school-fee.types';
import { Specialty } from '@/lib/school-fee.types';

export async function getSpecialtiesByDepartment(departmentId: string): Promise<SchoolFeeListResponse<Specialty>> {
  try {
    const supabase = await createClient();
    
    const { data: specialties, error } = await supabase
      .from('specialties')
      .select(`
        *,
        department:departments(
          *,
          school:schools(*)
        )
      `)
      .eq('department_id', departmentId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching specialties:', error);
      return { data: [], hasMore: false, totalRecords: 0, error: 'Failed to fetch specialties' };
    }

    return {
      data: specialties || [],
      hasMore: false,
      totalRecords: specialties?.length || 0,
    };
  } catch (error) {
    console.error('Error in getSpecialtiesByDepartment:', error);
    return { data: [], hasMore: false, totalRecords: 0, error: 'Something went wrong' };
  }
}

export async function getMySpecialties(): Promise<SchoolFeeListResponse<Specialty>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: [], hasMore: false, totalRecords: 0, error: 'Not authenticated' };
    }

    const { data: specialties, error } = await supabase
      .from('specialties')
      .select(`
        *,
        department:departments(
          *,
          school:schools(*)
        )
      `)
      .eq('department.school.admin_user_id', user.id)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching my specialties:', error);
      return { data: [], hasMore: false, totalRecords: 0, error: 'Failed to fetch specialties' };
    }

    return {
      data: specialties || [],
      hasMore: false,
      totalRecords: specialties?.length || 0,
    };
  } catch (error) {
    console.error('Error in getMySpecialties:', error);
    return { data: [], hasMore: false, totalRecords: 0, error: 'Something went wrong' };
  }
}