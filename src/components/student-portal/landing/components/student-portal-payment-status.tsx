import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

const upcomingPayments = [
  {
    id: '1',
    description: 'Software Engineering - Installment 2',
    amount: 2000,
    dueDate: '2024-02-15',
    status: 'due',
  },
  {
    id: '2',
    description: 'Digital Marketing - Final Payment',
    amount: 1500,
    dueDate: '2024-03-01',
    status: 'upcoming',
  },
];

export function StudentPortalPaymentStatus() {
  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between items-center text-xl mb-6 font-medium">
          Payment Status
        </CardTitle>
      </CardHeader>
      <CardContent className={'p-0 flex flex-col gap-6'}>
        {upcomingPayments.map((payment) => (
          <div key={payment.id} className={'border border-border rounded-lg p-4'}>
            <div className={'flex items-start gap-3'}>
              <div className={`p-2 rounded-lg ${
                payment.status === 'due' 
                  ? 'bg-red-100 dark:bg-red-900/20' 
                  : 'bg-yellow-100 dark:bg-yellow-900/20'
              }`}>
                {payment.status === 'due' ? (
                  <AlertTriangle className={'h-4 w-4 text-red-600 dark:text-red-400'} />
                ) : (
                  <Calendar className={'h-4 w-4 text-yellow-600 dark:text-yellow-400'} />
                )}
              </div>
              <div className={'flex-1'}>
                <p className={'font-medium text-sm'}>{payment.description}</p>
                <div className={'flex items-center gap-2 mt-1'}>
                  <DollarSign className={'h-3 w-3 text-muted-foreground'} />
                  <span className={'text-sm font-semibold'}>${payment.amount.toLocaleString()}</span>
                </div>
                <p className={'text-xs text-muted-foreground mt-1'}>
                  Due: {formatDate(payment.dueDate)}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        <Button asChild className={'w-full'}>
          <Link href={'/student-portal/payments'}>
            Make Payment
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}