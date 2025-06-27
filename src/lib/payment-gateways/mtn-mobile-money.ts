import crypto from 'crypto';
import { PaymentGateway, PaymentRequest, PaymentResponse, WebhookPayload, PaymentGatewayConfig } from './types';

export class MTNMobileMoneyGateway implements PaymentGateway {
  name = 'MTN Mobile Money';
  private config: PaymentGatewayConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
  }

  private get baseUrl(): string {
    return this.config.environment === 'production' 
      ? this.config.apiUrl 
      : this.config.sandboxUrl;
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/collection/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64')}`,
          'Ocp-Apim-Subscription-Key': this.config.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));
      
      return this.accessToken;
    } catch (error) {
      console.error('MTN MoMo: Failed to get access token:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Initiate payment request
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const transactionId = crypto.randomUUID();

      const payload = {
        amount: request.amount.toString(),
        currency: request.currency,
        externalId: request.reference,
        payer: {
          partyIdType: 'MSISDN',
          partyId: request.phoneNumber.replace(/^\+/, ''), // Remove + prefix
        },
        payerMessage: request.description,
        payeeNote: `School fee payment - ${request.reference}`,
      };

      const response = await fetch(`${this.baseUrl}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Reference-Id': transactionId,
          'X-Target-Environment': this.config.environment,
          'Ocp-Apim-Subscription-Key': this.config.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 202) {
        // Payment request accepted
        return {
          success: true,
          transactionId,
          status: 'pending',
          message: 'Payment request sent to user mobile phone',
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          transactionId,
          status: 'failed',
          message: errorData.message || 'Payment initiation failed',
          gatewayResponse: errorData,
        };
      }
    } catch (error) {
      console.error('MTN MoMo: Payment initiation failed:', error);
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
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/collection/v1_0/requesttopay/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Target-Environment': this.config.environment,
          'Ocp-Apim-Subscription-Key': this.config.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to verify payment: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: data.status === 'SUCCESSFUL',
        transactionId,
        status: this.mapMTNStatus(data.status),
        message: data.reason || 'Payment verification completed',
        gatewayResponse: data,
      };
    } catch (error) {
      console.error('MTN MoMo: Payment verification failed:', error);
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
        console.error('MTN MoMo: Invalid webhook signature');
        return false;
      }

      // Process the webhook
      console.log('MTN MoMo: Processing webhook:', payload);
      
      // Update payment status in database
      // This would integrate with your payment tracking system
      
      return true;
    } catch (error) {
      console.error('MTN MoMo: Webhook processing failed:', error);
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
      console.error('MTN MoMo: Signature validation failed:', error);
      return false;
    }
  }

  /**
   * Map MTN status to our standard status
   */
  private mapMTNStatus(mtnStatus: string): 'pending' | 'completed' | 'failed' | 'cancelled' {
    switch (mtnStatus) {
      case 'SUCCESSFUL':
        return 'completed';
      case 'PENDING':
        return 'pending';
      case 'FAILED':
        return 'failed';
      case 'REJECTED':
      case 'TIMEOUT':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
}