import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { SchoolManagement } from '@/components/school-admin/schools/school-management';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';

export default function SchoolsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'School Management'} />
      <Suspense fallback={<LoadingScreen />}>
        <SchoolManagement />
      </Suspense>
    </main>
  );
}