import { SuperAdminOverviewCards } from '@/components/super-admin/landing/components/super-admin-overview-cards';
import { SuperAdminRecentActivity } from '@/components/super-admin/landing/components/super-admin-recent-activity';
import { SuperAdminTopSchools } from '@/components/super-admin/landing/components/super-admin-top-schools';
import { SuperAdminQuickActions } from '@/components/super-admin/landing/components/super-admin-quick-actions';
import { SuperAdminRevenueChart } from '@/components/super-admin/landing/components/super-admin-revenue-chart';

export function SuperAdminLandingPage() {
  return (
    <div className={'grid flex-1 items-start gap-6 p-0 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}>
      <div className={'grid auto-rows-max items-start gap-6 lg:col-span-2'}>
        <SuperAdminOverviewCards />
        <SuperAdminRevenueChart />
        <SuperAdminRecentActivity />
      </div>
      <div className={'grid auto-rows-max items-start gap-6'}>
        <SuperAdminQuickActions />
        <SuperAdminTopSchools />
      </div>
    </div>
  );
}