import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { AuditLogsManagement } from '@/components/super-admin/audit/audit-logs-management';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';

export default function AuditLogsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'Audit Logs'} />
      <Suspense fallback={<LoadingScreen />}>
        <AuditLogsManagement />
      </Suspense>
    </main>
  );
}