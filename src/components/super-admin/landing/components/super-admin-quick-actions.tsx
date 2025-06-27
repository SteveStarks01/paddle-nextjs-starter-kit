import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, CreditCard, BarChart3, Shield, Settings, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const quickActions = [
  {
    title: 'Review School Applications',
    description: 'Approve or reject pending schools',
    icon: <Building size={20} />,
    href: '/super-admin/schools',
    urgent: true,
  },
  {
    title: 'Process Refunds',
    description: 'Handle refund requests',
    icon: <CreditCard size={20} />,
    href: '/super-admin/refunds',
    urgent: true,
  },
  {
    title: 'View Analytics',
    description: 'Platform performance metrics',
    icon: <BarChart3 size={20} />,
    href: '/super-admin/analytics',
    urgent: false,
  },
  {
    title: 'Audit Logs',
    description: 'Review system activity',
    icon: <Shield size={20} />,
    href: '/super-admin/audit',
    urgent: false,
  },
  {
    title: 'System Settings',
    description: 'Configure platform settings',
    icon: <Settings size={20} />,
    href: '/super-admin/settings',
    urgent: false,
  },
  {
    title: 'Transaction Monitoring',
    description: 'Monitor all transactions',
    icon: <AlertTriangle size={20} />,
    href: '/super-admin/transactions',
    urgent: false,
  },
];

export function SuperAdminQuickActions() {
  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between items-center text-xl mb-6 font-medium">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className={'p-0 flex flex-col gap-3'}>
        {quickActions.map((action) => (
          <Button
            key={action.title}
            asChild
            variant="outline"
            className={`h-auto p-4 justify-start border-border hover:bg-accent ${
              action.urgent ? 'border-yellow-500/50 bg-yellow-500/5' : ''
            }`}
          >
            <Link href={action.href} className="flex items-center gap-3">
              {action.icon}
              <div className="flex flex-col items-start gap-1">
                <span className="font-medium">{action.title}</span>
                <span className="text-sm text-muted-foreground">{action.description}</span>
              </div>
              {action.urgent && (
                <AlertTriangle size={16} className="ml-auto text-yellow-500" />
              )}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}