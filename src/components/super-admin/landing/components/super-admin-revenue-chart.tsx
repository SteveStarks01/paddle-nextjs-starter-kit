'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSystemAnalytics } from '@/utils/super-admin/get-analytics';
import { SystemAnalytics } from '@/lib/super-admin.types';

export function SuperAdminRevenueChart() {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await getSystemAnalytics();
        if (response.data) {
          setAnalytics(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
        <CardHeader className="p-0 space-y-0">
          <CardTitle className="text-xl font-medium mb-6">Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent className={'p-0'}>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="text-xl font-medium mb-6">Revenue Trends</CardTitle>
      </CardHeader>
      <CardContent className={'p-0'}>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">
              ${(analytics?.monthlyRevenue || 0).toLocaleString()}
            </div>
            <div className="text-muted-foreground">This Month's Revenue</div>
            <div className="mt-4 text-sm text-secondary">
              {analytics?.revenueByMonth?.length || 0} months of data available
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}