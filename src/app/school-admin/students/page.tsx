import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { StudentManagement } from '@/components/school-admin/students/student-management';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';

export default function StudentsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'Student Management'} />
      <Suspense fallback={<LoadingScreen />}>
        <StudentManagement />
      </Suspense>
    </main>
  );
}