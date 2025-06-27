import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { StudentEnrollmentPage } from '@/components/student-portal/enrollment/student-enrollment-page';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';

export default function EnrollmentPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'Enrollment'} />
      <Suspense fallback={<LoadingScreen />}>
        <StudentEnrollmentPage />
      </Suspense>
    </main>
  );
}