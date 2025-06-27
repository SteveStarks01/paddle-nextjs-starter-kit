import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Smartphone, CreditCard, Calendar, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function DashboardSubscriptionCardGroup() {
  // Mock data for school subscription
  const subscription = {
    plan: 'Professional Plan',
    status: 'active',
    nextBilling: '2024-02-15',
    amount: 199,
    currency: 'USD',
    features: ['Up to 2,000 students', 'Advanced reporting', 'Priority support'],
  };

  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
          <span className={'text-xl font-medium'}>School Subscription</span>
          <Button asChild={true} size={'sm'} variant={'outline'} className={'text-sm rounded-sm border-border'}>
            <Link href={'/dashboard/billing'}>Manage Billing</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className={'p-0 pt-6'}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{subscription.plan}</h3>
              <p className="text-muted-foreground">
                ${subscription.amount}/{subscription.currency} per month
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-600 capitalize">
                {subscription.status}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Plan Features:</h4>
            <ul className="space-y-2">
              {subscription.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next billing date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">
                    {formatDate(subscription.nextBilling)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Payment method</p>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Mobile Money</span>
                </div>
              </div>
            </div>
          </div>

          <Button className="w-full" variant="outline">
            <CreditCard className="mr-2 h-4 w-4" />
            Update Payment Method
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}