'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Download, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { StudentPortalQueries } from '@/lib/db/queries/student-portal-queries';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { ErrorContent } from '@/components/dashboard/layout/error-content';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MobileMoneyPayment } from '@/components/payments/mobile-money-payment';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface PaymentPlan {
  id: string;
  planType: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  numberOfInstallments: number;
  installmentAmount?: number;
  dueDate?: string;
  status: string;
  enrollment?: {
    specialty?: {
      name: string;
      department?: {
        name: string;
        school?: {
          name: string;
        };
      };
    };
  };
}

export function StudentPaymentsPage() {
  const { toast } = useToast();
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);

  useEffect(() => {
    loadPaymentPlans();
  }, []);

  const loadPaymentPlans = async () => {
    try {
      setLoading(true);
      // This would use your Drizzle queries
      const mockPlans: PaymentPlan[] = [
        {
          id: '1',
          planType: 'installment',
          totalAmount: 8500,
          paidAmount: 5500,
          outstandingAmount: 3000,
          numberOfInstallments: 4,
          installmentAmount: 2125,
          dueDate: '2024-02-15',
          status: 'active',
          enrollment: {
            specialty: {
              name: 'Software Engineering',
              department: {
                name: 'Computer Science',
                school: {
                  name: 'Tech University',
                },
              },
            },
          },
        },
        {
          id: '2',
          planType: 'full',
          totalAmount: 4000,
          paidAmount: 4000,
          outstandingAmount: 0,
          numberOfInstallments: 1,
          status: 'completed',
          enrollment: {
            specialty: {
              name: 'Digital Marketing',
              department: {
                name: 'Business Administration',
                school: {
                  name: 'Business College',
                },
              },
            },
          },
        },
      ];
      setPaymentPlans(mockPlans);
    } catch (err) {
      setError('Failed to load payment plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (plan: PaymentPlan) => {
    setSelectedPlan(plan);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);
    setSelectedPlan(null);
    loadPaymentPlans(); // Reload data
    toast({
      title: 'Payment successful',
      description: 'Your payment has been processed successfully.',
    });
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorContent />;

  return (
    <div className="grid gap-6">
      <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
        <CardHeader className="p-0 space-y-0">
          <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
            <span className={'text-xl font-medium'}>Payment Plans</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              <span>Mobile Money Available</span>
            </div>
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
                const progressPercentage = (plan.paidAmount / plan.totalAmount) * 100;
                
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
                                Academic Year 2024-2025
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={plan.planType === 'full' ? 'default' : 'secondary'}>
                                {plan.planType === 'full' ? 'Full Payment' : 'Installment'}
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
                                  ${plan.totalAmount.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Paid Amount:</span>
                                <p className="font-semibold text-lg text-green-600">
                                  ${plan.paidAmount.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Outstanding:</span>
                                <p className="font-semibold text-lg text-red-600">
                                  ${plan.outstandingAmount.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {plan.planType === 'installment' && (
                            <div className="bg-muted/50 rounded-lg p-4">
                              <h4 className="font-semibold mb-2">Installment Details</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Number of Installments:</span>
                                  <span className="font-semibold">
                                    {plan.numberOfInstallments}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Amount per Installment:</span>
                                  <span className="font-semibold">
                                    ${plan.installmentAmount?.toLocaleString()}
                                  </span>
                                </div>
                                {plan.dueDate && (
                                  <div className="flex justify-between">
                                    <span>Next Due Date:</span>
                                    <span className="font-semibold">
                                      {new Date(plan.dueDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex flex-col gap-2">
                            {plan.outstandingAmount > 0 && (
                              <Button 
                                className="w-full"
                                onClick={() => handlePayment(plan)}
                              >
                                <Smartphone className="mr-2 h-4 w-4" />
                                Pay ${plan.outstandingAmount.toLocaleString()}
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

      {/* Mobile Money Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <MobileMoneyPayment
              paymentPlanId={selectedPlan.id}
              amount={selectedPlan.outstandingAmount}
              currency="USD"
              studentInfo={{
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                studentId: 'STU001',
              }}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setShowPaymentDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}