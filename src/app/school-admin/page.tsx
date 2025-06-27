import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { SchoolAdminLandingPage } from '@/components/school-admin/landing/school-admin-landing-page';

export default function SchoolAdminPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'School Administration'} />
      <SchoolAdminLandingPage />
    </main>
  );
}