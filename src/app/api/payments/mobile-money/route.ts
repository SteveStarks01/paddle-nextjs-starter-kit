import { NextRequest, NextResponse } from 'next/server';
import { PaymentService, MobileMoneyPaymentRequest } from '@/lib/payment-gateways/payment-service';
import { createClient } from '@/utils/supabase/server';
import { initializePaymentGateways } from '@/lib/payment-gateways/initialize';

// Initialize payment gateways
initializePaymentGateways();

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: MobileMoneyPaymentRequest = await request.json();

    // Validate request
    if (!body.paymentPlanId || !body.amount || !body.phoneNumber || !body.gateway) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process payment
    const result = await PaymentService.processMobileMoneyPayment(body);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Mobile money payment failed:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}