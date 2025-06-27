import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { StudentPaymentsPage } from '@/components/student-portal/payments/student-payments-page';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';

export default function PaymentsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'My Payments'} />
      <Suspense fallback={<LoadingScreen />}>
        <StudentPaymentsPage />
      </Suspense>
    </main>
  );
}