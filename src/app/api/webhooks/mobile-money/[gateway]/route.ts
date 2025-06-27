import { NextRequest, NextResponse } from 'next/server';
import { PaymentGatewayFactory } from '@/lib/payment-gateways/gateway-factory';
import { PaymentService } from '@/lib/payment-gateways/payment-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { gateway: string } }
) {
  try {
    const gateway = params.gateway as 'mtn' | 'orange';
    
    if (!PaymentGatewayFactory.isGatewayAvailable(gateway)) {
      return NextResponse.json(
        { error: 'Gateway not available' },
        { status: 400 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('x-signature') || request.headers.get('signature') || '';

    // Parse webhook payload
    const payload = JSON.parse(body);
    payload.signature = signature;

    // Get gateway instance and handle webhook
    const gatewayInstance = PaymentGatewayFactory.getGateway(gateway);
    const isValid = await gatewayInstance.handleWebhook(payload);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook' },
        { status: 400 }
      );
    }

    // Verify payment status
    if (payload.transactionId) {
      await PaymentService.verifyPayment(payload.transactionId, gateway);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}