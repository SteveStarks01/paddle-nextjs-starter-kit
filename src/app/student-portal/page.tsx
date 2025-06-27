import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { StudentPortalLandingPage } from '@/components/student-portal/landing/student-portal-landing-page';

export default function StudentPortalPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'Student Portal'} />
      <StudentPortalLandingPage />
    </main>
  );
}