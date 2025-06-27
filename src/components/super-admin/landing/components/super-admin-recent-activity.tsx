import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Clock, Building, CreditCard, AlertTriangle } from 'lucide-react';

const recentActivities = [
  {
    id: '1',
    type: 'school_approval',
    title: 'New school registration',
    description: 'Tech University submitted registration',
    timestamp: '2 hours ago',
    status: 'pending',
    icon: <Building size={16} />,
  },
  {
    id: '2',
    type: 'transaction',
    title: 'Large transaction processed',
    description: '$5,000 payment from Business College',
    timestamp: '4 hours ago',
    status: 'completed',
    icon: <CreditCard size={16} />,
  },
  {
    id: '3',
    type: 'refund',
    title: 'Refund request submitted',
    description: 'Student refund request for $1,200',
    timestamp: '6 hours ago',
    status: 'pending',
    icon: <AlertTriangle size={16} />,
  },
  {
    id: '4',
    type: 'school_approval',
    title: 'School approved',
    description: 'Engineering Institute approved and activated',
    timestamp: '1 day ago',
    status: 'approved',
    icon: <Building size={16} />,
  },
];

export function SuperAdminRecentActivity() {
  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
          <span className={'text-xl font-medium'}>Recent Activity</span>
          <Button asChild={true} size={'sm'} variant={'outline'} className={'text-sm rounded-sm border-border'}>
            <Link href={'/super-admin/audit'}>View all</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className={'p-0 pt-6'}>
        <div className={'flex flex-col gap-4'}>
          {recentActivities.map((activity) => (
            <div key={activity.id} className={'flex items-start gap-4 border-border border-b pb-4 last:border-b-0'}>
              <div className={`p-2 rounded-lg ${
                activity.type === 'school_approval' ? 'bg-blue-100 dark:bg-blue-900/20' :
                activity.type === 'transaction' ? 'bg-green-100 dark:bg-green-900/20' :
                'bg-yellow-100 dark:bg-yellow-900/20'
              }`}>
                {activity.icon}
              </div>
              <div className={'flex-1'}>
                <div className={'flex justify-between items-start mb-1'}>
                  <h4 className={'font-semibold text-sm'}>{activity.title}</h4>
                  <Badge variant={
                    activity.status === 'completed' || activity.status === 'approved' ? 'default' :
                    activity.status === 'pending' ? 'secondary' : 'outline'
                  }>
                    {activity.status}
                  </Badge>
                </div>
                <p className={'text-sm text-muted-foreground mb-2'}>{activity.description}</p>
                <div className={'flex items-center gap-1 text-xs text-muted-foreground'}>
                  <Clock size={12} />
                  {activity.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}