import { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

interface Props {
  children: ReactNode;
}

export default async function SuperAdminLayout({ children }: Props) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) {
    redirect('/login');
  }

  // Verify super admin access
  const { data: superAdmin } = await supabase
    .from('super_admin_users')
    .select('*')
    .eq('user_id', data.user.id)
    .eq('is_active', true)
    .single();

  if (!superAdmin) {
    redirect('/dashboard');
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}