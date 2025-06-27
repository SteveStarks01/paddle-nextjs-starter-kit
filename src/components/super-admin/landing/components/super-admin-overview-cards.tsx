'use client';

import { useEffect, useState } from 'react';
import { Building, Users, DollarSign, TrendingUp, AlertCircle, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSystemAnalytics } from '@/utils/super-admin/get-analytics';
import { SystemAnalytics } from '@/lib/super-admin.types';

export function SuperAdminOverviewCards() {
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

  const overviewData = [
    {
      title: 'Total Schools',
      icon: <Building className={'text-[#4B4F4F]'} size={18} />,
      value: loading ? '...' : analytics?.totalSchools.toLocaleString() || '0',
      change: `${analytics?.activeSchools || 0} active`,
    },
    {
      title: 'Total Students',
      icon: <Users className={'text-[#4B4F4F]'} size={18} />,
      value: loading ? '...' : analytics?.totalStudents.toLocaleString() || '0',
      change: 'Across all schools',
    },
    {
      title: 'Total Revenue',
      icon: <DollarSign className={'text-[#4B4F4F]'} size={18} />,
      value: loading ? '...' : `$${(analytics?.totalRevenue || 0).toLocaleString()}`,
      change: `$${(analytics?.monthlyRevenue || 0).toLocaleString()} this month`,
    },
    {
      title: 'Platform Commission',
      icon: <TrendingUp className={'text-[#4B4F4F]'} size={18} />,
      value: loading ? '...' : `$${(analytics?.platformCommission || 0).toLocaleString()}`,
      change: 'Total earned',
    },
    {
      title: 'Pending Approvals',
      icon: <AlertCircle className={'text-[#4B4F4F]'} size={18} />,
      value: loading ? '...' : analytics?.pendingApprovals.toString() || '0',
      change: 'Schools awaiting approval',
    },
    {
      title: 'Transaction Volume',
      icon: <CreditCard className={'text-[#4B4F4F]'} size={18} />,
      value: loading ? '...' : analytics?.transactionVolume.toLocaleString() || '0',
      change: `Avg: $${(analytics?.averageTransactionValue || 0).toFixed(2)}`,
    },
  ];

  return (
    <div className={'grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3'}>
      {overviewData.map((card) => (
        <Card key={card.title} className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
          <CardHeader className="p-0 space-y-0">
            <CardTitle className="flex justify-between items-center mb-6">
              <span className={'text-base leading-4'}>{card.title}</span> {card.icon}
            </CardTitle>
            <CardDescription className={'text-[32px] leading-[32px] text-primary'}>{card.value}</CardDescription>
          </CardHeader>
          <CardContent className={'p-0'}>
            <div className="text-sm leading-[14px] pt-2 text-secondary">{card.change}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}