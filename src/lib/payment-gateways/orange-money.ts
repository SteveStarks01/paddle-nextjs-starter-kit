import crypto from 'crypto';
import { PaymentGateway, PaymentRequest, PaymentResponse, WebhookPayload, PaymentGatewayConfig } from './types';

export class OrangeMoneyGateway implements PaymentGateway {
  name = 'Orange Money';
  private config: PaymentGatewayConfig;

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
  }

  private get baseUrl(): string {
    return this.config.environment === 'production' 
      ? this.config.apiUrl 
      : this.config.sandboxUrl;
  }

  /**
   * Generate HMAC signature for Orange Money API
   */
  private generateSignature(data: string, timestamp: string): string {
    const message = `${data}${timestamp}`;
    return crypto
      .createHmac('sha256', this.config.apiSecret)
      .update(message)
      .digest('hex');
  }

  /**
   * Initiate payment request
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const timestamp = Date.now().toString();
      const transactionId = crypto.randomUUID();

      const payload = {
        merchant_key: this.config.apiKey,
        currency: request.currency,
        order_id: request.reference,
        amount: request.amount,
        return_url: request.callbackUrl,
        cancel_url: request.callbackUrl,
        notif_url: request.callbackUrl,
        lang: 'en',
        reference: transactionId,
        customer_msisdn: request.phoneNumber.replace(/^\+/, ''),
        customer_email: request.metadata?.email || '',
        customer_firstname: request.metadata?.firstName || '',
        customer_lastname: request.metadata?.lastName || '',
      };

      const dataString = JSON.stringify(payload);
      const signature = this.generateSignature(dataString, timestamp);

      const response = await fetch(`${this.baseUrl}/api/ecommerce/v1/webpayment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Timestamp': timestamp,
          'X-Signature': signature,
        },
        body: dataString,
      });

      const responseData = await response.json();

      if (response.ok && responseData.status === 'SUCCESS') {
        return {
          success: true,
          transactionId,
          status: 'pending',
          message: 'Payment request initiated successfully',
          gatewayResponse: responseData,
        };
      } else {
        return {
          success: false,
          transactionId,
          status: 'failed',
          message: responseData.message || 'Payment initiation failed',
          gatewayResponse: responseData,
        };
      }
    } catch (error) {
      console.error('Orange Money: Payment initiation failed:', error);
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        message: error.message || 'Payment initiation failed',
      };
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(transactionId: string): Promise<PaymentResponse> {
    try {
      const timestamp = Date.now().toString();
      const queryData = `transaction_id=${transactionId}`;
      const signature = this.generateSignature(queryData, timestamp);

      const response = await fetch(`${this.baseUrl}/api/ecommerce/v1/transactionstatus?${queryData}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Timestamp': timestamp,
          'X-Signature': signature,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to verify payment: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: data.status === 'SUCCESS',
        transactionId,
        status: this.mapOrangeStatus(data.status),
        message: data.message || 'Payment verification completed',
        gatewayResponse: data,
      };
    } catch (error) {
      console.error('Orange Money: Payment verification failed:', error);
      return {
        success: false,
        transactionId,
        status: 'failed',
        message: error.message || 'Payment verification failed',
      };
    }
  }

  /**
   * Handle webhook notifications
   */
  async handleWebhook(payload: WebhookPayload): Promise<boolean> {
    try {
      // Validate webhook signature
      if (!this.validateWebhookSignature(JSON.stringify(payload), payload.signature)) {
        console.error('Orange Money: Invalid webhook signature');
        return false;
      }

      // Process the webhook
      console.log('Orange Money: Processing webhook:', payload);
      
      // Update payment status in database
      // This would integrate with your payment tracking system
      
      return true;
    } catch (error) {
      console.error('Orange Money: Webhook processing failed:', error);
      return false;
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Orange Money: Signature validation failed:', error);
      return false;
    }
  }

  /**
   * Map Orange Money status to our standard status
   */
  private mapOrangeStatus(orangeStatus: string): 'pending' | 'completed' | 'failed' | 'cancelled' {
    switch (orangeStatus) {
      case 'SUCCESS':
      case 'SUCCESSFUL':
        return 'completed';
      case 'PENDING':
      case 'INITIATED':
        return 'pending';
      case 'FAILED':
      case 'ERROR':
        return 'failed';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
}