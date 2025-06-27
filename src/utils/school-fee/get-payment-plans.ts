'use server';

import { createClient } from '@/utils/supabase/server';
import { SchoolFeeListResponse, SchoolFeeResponse } from '@/lib/school-fee.types';
import { PaymentPlan } from '@/lib/school-fee.types';

export async function getMyPaymentPlans(): Promise<SchoolFeeListResponse<PaymentPlan>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: [], hasMore: false, totalRecords: 0, error: 'Not authenticated' };
    }

    const { data: paymentPlans, error } = await supabase
      .from('payment_plans')
      .select(`
        *,
        enrollment:student_enrollments(
          *,
          specialty:specialties(
            *,
            department:departments(
              *,
              school:schools(*)
            )
          ),
          fee_structure:fee_structures(*)
        )
      `)
      .eq('enrollment.student_user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment plans:', error);
      return { data: [], hasMore: false, totalRecords: 0, error: 'Failed to fetch payment plans' };
    }

    return {
      data: paymentPlans || [],
      hasMore: false,
      totalRecords: paymentPlans?.length || 0,
    };
  } catch (error) {
    console.error('Error in getMyPaymentPlans:', error);
    return { data: [], hasMore: false, totalRecords: 0, error: 'Something went wrong' };
  }
}

export async function getPaymentPlanById(planId: string): Promise<SchoolFeeResponse<PaymentPlan>> {
  try {
    const supabase = await createClient();
    
    const { data: paymentPlan, error } = await supabase
      .from('payment_plans')
      .select(`
        *,
        enrollment:student_enrollments(
          *,
          specialty:specialties(
            *,
            department:departments(
              *,
              school:schools(*)
            )
          ),
          fee_structure:fee_structures(*)
        )
      `)
      .eq('id', planId)
      .single();

    if (error) {
      console.error('Error fetching payment plan:', error);
      return { error: 'Payment plan not found' };
    }

    return { data: paymentPlan };
  } catch (error) {
    console.error('Error in getPaymentPlanById:', error);
    return { error: 'Something went wrong' };
  }
}