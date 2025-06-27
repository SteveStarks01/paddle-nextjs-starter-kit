import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { TransactionManagement } from '@/components/super-admin/transactions/transaction-management';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';

export default function TransactionsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'Transaction Management'} />
      <Suspense fallback={<LoadingScreen />}>
        <TransactionManagement />
      </Suspense>
    </main>
  );
}