import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment-gateways/payment-service';
import { createClient } from '@/utils/supabase/server';

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

    const { transactionId, gateway } = await request.json();

    if (!transactionId || !gateway) {
      return NextResponse.json(
        { error: 'Missing transaction ID or gateway' },
        { status: 400 }
      );
    }

    const result = await PaymentService.verifyPayment(transactionId, gateway);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}