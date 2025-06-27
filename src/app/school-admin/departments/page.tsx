import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { DepartmentManagement } from '@/components/school-admin/departments/department-management';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';

export default function DepartmentsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'Department Management'} />
      <Suspense fallback={<LoadingScreen />}>
        <DepartmentManagement />
      </Suspense>
    </main>
  );
}