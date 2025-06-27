import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { SchoolApprovalsManagement } from '@/components/super-admin/schools/school-approvals-management';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';

export default function SchoolApprovalsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'School Management'} />
      <Suspense fallback={<LoadingScreen />}>
        <SchoolApprovalsManagement />
      </Suspense>
    </main>
  );
}