export interface PaymentGatewayConfig {
  name: string;
  apiUrl: string;
  sandboxUrl: string;
  apiKey: string;
  apiSecret: string;
  environment: 'sandbox' | 'production';
  webhookSecret: string;
  supportedCurrencies: string[];
  supportedCountries: string[];
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  reference: string;
  description: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  message: string;
  gatewayResponse?: any;
}

export interface WebhookPayload {
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  reference: string;
  timestamp: string;
  signature: string;
}

export interface PaymentGateway {
  name: string;
  initiatePayment(request: PaymentRequest): Promise<PaymentResponse>;
  verifyPayment(transactionId: string): Promise<PaymentResponse>;
  handleWebhook(payload: WebhookPayload): Promise<boolean>;
  validateWebhookSignature(payload: string, signature: string): boolean;
}