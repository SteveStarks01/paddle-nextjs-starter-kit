'use server';

import { createClient } from '@/utils/supabase/server';
import { SchoolFeeListResponse } from '@/lib/school-fee.types';
import { School } from '@/lib/school-fee.types';

export async function getSchools(): Promise<SchoolFeeListResponse<School>> {
  try {
    const supabase = await createClient();
    
    const { data: schools, error } = await supabase
      .from('schools')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching schools:', error);
      return { data: [], hasMore: false, totalRecords: 0, error: 'Failed to fetch schools' };
    }

    return {
      data: schools || [],
      hasMore: false,
      totalRecords: schools?.length || 0,
    };
  } catch (error) {
    console.error('Error in getSchools:', error);
    return { data: [], hasMore: false, totalRecords: 0, error: 'Something went wrong' };
  }
}

export async function getSchoolById(schoolId: string): Promise<SchoolFeeResponse<School>> {
  try {
    const supabase = await createClient();
    
    const { data: school, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching school:', error);
      return { error: 'School not found' };
    }

    return { data: school };
  } catch (error) {
    console.error('Error in getSchoolById:', error);
    return { error: 'Something went wrong' };
  }
}

export async function getMySchool(): Promise<SchoolFeeResponse<School>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { data: school, error } = await supabase
      .from('schools')
      .select('*')
      .eq('admin_user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching my school:', error);
      return { error: 'School not found' };
    }

    return { data: school };
  } catch (error) {
    console.error('Error in getMySchool:', error);
    return { error: 'Something went wrong' };
  }
}