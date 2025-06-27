import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { RefundManagement } from '@/components/super-admin/refunds/refund-management';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';

export default function RefundsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'Refund Management'} />
      <Suspense fallback={<LoadingScreen />}>
        <RefundManagement />
      </Suspense>
    </main>
  );
}