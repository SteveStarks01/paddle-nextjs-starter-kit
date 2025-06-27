import { SchoolAdminOverviewCards } from '@/components/school-admin/landing/components/school-admin-overview-cards';
import { SchoolAdminRecentEnrollments } from '@/components/school-admin/landing/components/school-admin-recent-enrollments';
import { SchoolAdminPaymentSummary } from '@/components/school-admin/landing/components/school-admin-payment-summary';
import { SchoolAdminQuickActions } from '@/components/school-admin/landing/components/school-admin-quick-actions';

export function SchoolAdminLandingPage() {
  return (
    <div className={'grid flex-1 items-start gap-6 p-0 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}>
      <div className={'grid auto-rows-max items-start gap-6 lg:col-span-2'}>
        <SchoolAdminOverviewCards />
        <SchoolAdminRecentEnrollments />
      </div>
      <div className={'grid auto-rows-max items-start gap-6'}>
        <SchoolAdminQuickActions />
        <SchoolAdminPaymentSummary />
      </div>
    </div>
  );
}