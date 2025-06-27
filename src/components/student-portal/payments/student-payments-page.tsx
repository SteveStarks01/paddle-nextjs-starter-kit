'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Download, Calendar, DollarSign } from 'lucide-react';
import { getMyPaymentPlans } from '@/utils/school-fee/get-payment-plans';
import { PaymentPlan } from '@/lib/school-fee.types';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { ErrorContent } from '@/components/dashboard/layout/error-content';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function StudentPaymentsPage() {
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPaymentPlans() {
      try {
        const response = await getMyPaymentPlans();
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setPaymentPlans(response.data);
        }
      } catch (err) {
        setError('Failed to load payment plans');
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentPlans();
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorContent />;

  return (
    <div className="grid gap-6">
      <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
        <CardHeader className="p-0 space-y-0">
          <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
            <span className={'text-xl font-medium'}>Payment Plans</span>
            <Button>
              <CreditCard className="mr-2 h-4 w-4" />
              Make Payment
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className={'p-0 pt-6'}>
          {paymentPlans.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No Payment Plans</h3>
              <p className="text-muted-foreground mb-6">
                You don't have any active payment plans. Enroll in a program to get started.
              </p>
              <Button>
                <CreditCard className="mr-2 h-4 w-4" />
                View Enrollments
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {paymentPlans.map((plan) => {
                const progressPercentage = (plan.paid_amount / plan.total_amount) * 100;
                
                return (
                  <Card key={plan.id} className="border-border">
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-semibold">
                                {plan.enrollment?.specialty?.department?.school?.name}
                              </h3>
                              <p className="text-muted-foreground">
                                {plan.enrollment?.specialty?.department?.name} - {plan.enrollment?.specialty?.name}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {plan.enrollment?.academic_year}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={plan.plan_type === 'full' ? 'default' : 'secondary'}>
                                {plan.plan_type === 'full' ? 'Full Payment' : 'Installment'}
                              </Badge>
                              <Badge variant={
                                plan.status === 'completed' ? 'default' :
                                plan.status === 'overdue' ? 'destructive' :
                                plan.status === 'active' ? 'secondary' : 'outline'
                              }>
                                {plan.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>Payment Progress</span>
                                <span>{progressPercentage.toFixed(1)}%</span>
                              </div>
                              <Progress value={progressPercentage} className="h-2" />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Total Amount:</span>
                                <p className="font-semibold text-lg">
                                  ${plan.total_amount.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Paid Amount:</span>
                                <p className="font-semibold text-lg text-green-600">
                                  ${plan.paid_amount.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Outstanding:</span>
                                <p className="font-semibold text-lg text-red-600">
                                  ${plan.outstanding_amount.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {plan.plan_type === 'installment' && (
                            <div className="bg-muted/50 rounded-lg p-4">
                              <h4 className="font-semibold mb-2">Installment Details</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Number of Installments:</span>
                                  <span className="font-semibold">
                                    {plan.number_of_installments}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Amount per Installment:</span>
                                  <span className="font-semibold">
                                    ${plan.installment_amount?.toLocaleString()}
                                  </span>
                                </div>
                                {plan.due_date && (
                                  <div className="flex justify-between">
                                    <span>Next Due Date:</span>
                                    <span className="font-semibold">
                                      {new Date(plan.due_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex flex-col gap-2">
                            {plan.outstanding_amount > 0 && (
                              <Button className="w-full">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pay ${plan.outstanding_amount.toLocaleString()}
                              </Button>
                            )}
                            <Button variant="outline" className="w-full">
                              <Calendar className="mr-2 h-4 w-4" />
                              View Schedule
                            </Button>
                            <Button variant="outline" className="w-full">
                              <Download className="mr-2 h-4 w-4" />
                              Download Receipt
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}