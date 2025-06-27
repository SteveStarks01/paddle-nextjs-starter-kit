import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Clock } from 'lucide-react';

const paymentSummary = [
  {
    title: 'This Month',
    amount: '$245,000',
    icon: <DollarSign size={16} className="text-green-500" />,
    trend: '+12%',
  },
  {
    title: 'Pending',
    amount: '$45,000',
    icon: <Clock size={16} className="text-yellow-500" />,
    trend: '-5%',
  },
  {
    title: 'Growth',
    amount: '+15%',
    icon: <TrendingUp size={16} className="text-blue-500" />,
    trend: 'vs last month',
  },
];

export function SchoolAdminPaymentSummary() {
  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between items-center text-xl mb-6 font-medium">
          Payment Summary
        </CardTitle>
      </CardHeader>
      <CardContent className={'p-0 flex flex-col gap-6'}>
        {paymentSummary.map((item) => (
          <div key={item.title} className={'flex justify-between items-center'}>
            <div className={'flex items-center gap-3'}>
              {item.icon}
              <div className={'flex flex-col gap-1'}>
                <span className={'text-sm text-secondary'}>{item.title}</span>
                <span className={'text-lg font-semibold'}>{item.amount}</span>
              </div>
            </div>
            <span className={'text-sm text-muted-foreground'}>{item.trend}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}