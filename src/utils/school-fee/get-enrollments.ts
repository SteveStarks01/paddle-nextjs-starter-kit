'use server';

import { createClient } from '@/utils/supabase/server';
import { SchoolFeeListResponse, SchoolFeeResponse } from '@/lib/school-fee.types';
import { StudentEnrollment } from '@/lib/school-fee.types';

export async function getMyEnrollments(): Promise<SchoolFeeListResponse<StudentEnrollment>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: [], hasMore: false, totalRecords: 0, error: 'Not authenticated' };
    }

    const { data: enrollments, error } = await supabase
      .from('student_enrollments')
      .select(`
        *,
        specialty:specialties(
          *,
          department:departments(
            *,
            school:schools(*)
          )
        ),
        fee_structure:fee_structures(*)
      `)
      .eq('student_user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching enrollments:', error);
      return { data: [], hasMore: false, totalRecords: 0, error: 'Failed to fetch enrollments' };
    }

    return {
      data: enrollments || [],
      hasMore: false,
      totalRecords: enrollments?.length || 0,
    };
  } catch (error) {
    console.error('Error in getMyEnrollments:', error);
    return { data: [], hasMore: false, totalRecords: 0, error: 'Something went wrong' };
  }
}

export async function getEnrollmentById(enrollmentId: string): Promise<SchoolFeeResponse<StudentEnrollment>> {
  try {
    const supabase = await createClient();
    
    const { data: enrollment, error } = await supabase
      .from('student_enrollments')
      .select(`
        *,
        specialty:specialties(
          *,
          department:departments(
            *,
            school:schools(*)
          )
        ),
        fee_structure:fee_structures(*)
      `)
      .eq('id', enrollmentId)
      .single();

    if (error) {
      console.error('Error fetching enrollment:', error);
      return { error: 'Enrollment not found' };
    }

    return { data: enrollment };
  } catch (error) {
    console.error('Error in getEnrollmentById:', error);
    return { error: 'Something went wrong' };
  }
}

export async function getSchoolEnrollments(schoolId?: string): Promise<SchoolFeeListResponse<StudentEnrollment>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: [], hasMore: false, totalRecords: 0, error: 'Not authenticated' };
    }

    let query = supabase
      .from('student_enrollments')
      .select(`
        *,
        specialty:specialties(
          *,
          department:departments(
            *,
            school:schools(*)
          )
        ),
        fee_structure:fee_structures(*)
      `);

    if (schoolId) {
      query = query.eq('specialty.department.school.id', schoolId);
    } else {
      query = query.eq('specialty.department.school.admin_user_id', user.id);
    }

    const { data: enrollments, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching school enrollments:', error);
      return { data: [], hasMore: false, totalRecords: 0, error: 'Failed to fetch enrollments' };
    }

    return {
      data: enrollments || [],
      hasMore: false,
      totalRecords: enrollments?.length || 0,
    };
  } catch (error) {
    console.error('Error in getSchoolEnrollments:', error);
    return { data: [], hasMore: false, totalRecords: 0, error: 'Something went wrong' };
  }
}