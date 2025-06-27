'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Smartphone, CheckCircle, XCircle } from 'lucide-react';
import { PaymentService } from '@/lib/payment-gateways/payment-service';

interface MobileMoneyPaymentProps {
  paymentPlanId: string;
  amount: number;
  currency: string;
  studentInfo: {
    firstName: string;
    lastName: string;
    email: string;
    studentId: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function MobileMoneyPayment({
  paymentPlanId,
  amount,
  currency,
  studentInfo,
  onSuccess,
  onCancel,
}: MobileMoneyPaymentProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gateway, setGateway] = useState<'mtn' | 'orange'>('mtn');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed' | null>(null);

  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: 'Phone number required',
        description: 'Please enter your mobile money phone number',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/payments/mobile-money', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentPlanId,
          amount,
          currency,
          phoneNumber,
          gateway,
          studentInfo,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTransactionId(result.transactionId);
        setPaymentStatus('pending');
        toast({
          title: 'Payment initiated',
          description: 'Please check your phone and approve the payment request',
        });
        
        // Start verification polling
        startVerificationPolling(result.transactionId);
      } else {
        toast({
          title: 'Payment failed',
          description: result.message || 'Failed to initiate payment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Payment error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startVerificationPolling = (txId: string) => {
    setVerifying(true);
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionId: txId,
            gateway,
          }),
        });

        const result = await response.json();

        if (result.status === 'completed') {
          setPaymentStatus('completed');
          setVerifying(false);
          clearInterval(pollInterval);
          toast({
            title: 'Payment successful',
            description: 'Your payment has been processed successfully',
          });
          onSuccess();
        } else if (result.status === 'failed' || result.status === 'cancelled') {
          setPaymentStatus('failed');
          setVerifying(false);
          clearInterval(pollInterval);
          toast({
            title: 'Payment failed',
            description: result.message || 'Payment was not completed',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Verification polling error:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (verifying) {
        setVerifying(false);
        toast({
          title: 'Payment timeout',
          description: 'Payment verification timed out. Please check your payment status manually.',
          variant: 'destructive',
        });
      }
    }, 300000);
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Mobile Money Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {formatAmount(amount, currency)}
          </div>
          <p className="text-sm text-muted-foreground">
            Payment for {studentInfo.firstName} {studentInfo.lastName}
          </p>
        </div>

        {!transactionId && (
          <>
            <div className="space-y-2">
              <Label htmlFor="gateway">Payment Provider</Label>
              <Select value={gateway} onValueChange={(value: 'mtn' | 'orange') => setGateway(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                  <SelectItem value="orange">Orange Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Money Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+237 6XX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Enter the phone number registered with your mobile money account
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} disabled={loading} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handlePayment} disabled={loading} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pay Now
              </Button>
            </div>
          </>
        )}

        {transactionId && (
          <div className="text-center space-y-4">
            {paymentStatus === 'pending' && (
              <>
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Payment Pending</h3>
                  <p className="text-sm text-muted-foreground">
                    Please check your phone and approve the payment request
                  </p>
                  {verifying && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Verifying payment status...
                    </p>
                  )}
                </div>
              </>
            )}

            {paymentStatus === 'completed' && (
              <>
                <div className="flex justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-600">Payment Successful</h3>
                  <p className="text-sm text-muted-foreground">
                    Your payment has been processed successfully
                  </p>
                </div>
              </>
            )}

            {paymentStatus === 'failed' && (
              <>
                <div className="flex justify-center">
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-600">Payment Failed</h3>
                  <p className="text-sm text-muted-foreground">
                    The payment could not be completed
                  </p>
                </div>
                <Button onClick={() => {
                  setTransactionId(null);
                  setPaymentStatus(null);
                }} variant="outline" className="w-full">
                  Try Again
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}