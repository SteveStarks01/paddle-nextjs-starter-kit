import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { AnalyticsDashboard } from '@/components/super-admin/analytics/analytics-dashboard';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';

export default function AnalyticsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'Analytics & Reports'} />
      <Suspense fallback={<LoadingScreen />}>
        <AnalyticsDashboard />
      </Suspense>
    </main>
  );
}