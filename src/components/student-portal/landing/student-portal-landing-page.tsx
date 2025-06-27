import { StudentPortalOverviewCards } from '@/components/student-portal/landing/components/student-portal-overview-cards';
import { StudentPortalEnrollments } from '@/components/student-portal/landing/components/student-portal-enrollments';
import { StudentPortalPaymentStatus } from '@/components/student-portal/landing/components/student-portal-payment-status';
import { StudentPortalQuickActions } from '@/components/student-portal/landing/components/student-portal-quick-actions';

export function StudentPortalLandingPage() {
  return (
    <div className={'grid flex-1 items-start gap-6 p-0 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}>
      <div className={'grid auto-rows-max items-start gap-6 lg:col-span-2'}>
        <StudentPortalOverviewCards />
        <StudentPortalEnrollments />
      </div>
      <div className={'grid auto-rows-max items-start gap-6'}>
        <StudentPortalQuickActions />
        <StudentPortalPaymentStatus />
      </div>
    </div>
  );
}