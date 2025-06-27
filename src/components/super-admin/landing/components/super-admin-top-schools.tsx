'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TrendingUp, Users, DollarSign } from 'lucide-react';
import { getSystemAnalytics } from '@/utils/super-admin/get-analytics';
import { SystemAnalytics } from '@/lib/super-admin.types';

export function SuperAdminTopSchools() {
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

  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
          <span className={'text-xl font-medium'}>Top Performing Schools</span>
          <Button asChild={true} size={'sm'} variant={'outline'} className={'text-sm rounded-sm border-border'}>
            <Link href={'/super-admin/schools'}>View all</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className={'p-0 pt-6'}>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <div className={'flex flex-col gap-4'}>
            {analytics?.topPerformingSchools?.slice(0, 5).map((school, index) => (
              <div key={school.id} className={'flex items-center gap-4 border-border border-b pb-4 last:border-b-0'}>
                <div className={'flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-semibold'}>
                  {index + 1}
                </div>
                <div className={'flex-1'}>
                  <h4 className={'font-semibold text-sm mb-1'}>{school.name}</h4>
                  <div className={'flex items-center gap-4 text-xs text-muted-foreground'}>
                    <div className={'flex items-center gap-1'}>
                      <Users size={12} />
                      {school.studentCount} students
                    </div>
                    <div className={'flex items-center gap-1'}>
                      <DollarSign size={12} />
                      ${school.revenue.toLocaleString()}
                    </div>
                    <div className={'flex items-center gap-1'}>
                      <TrendingUp size={12} />
                      {school.growthRate}% growth
                    </div>
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">No data available</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}