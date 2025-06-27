import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { SuperAdminLandingPage } from '@/components/super-admin/landing/super-admin-landing-page';

export default function SuperAdminPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'Super Admin Dashboard'} />
      <SuperAdminLandingPage />
    </main>
  );
}