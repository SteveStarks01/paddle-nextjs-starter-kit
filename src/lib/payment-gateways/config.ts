import { PaymentGatewayConfig } from './types';

export const getPaymentGatewayConfigs = (): Record<'mtn' | 'orange', PaymentGatewayConfig> => {
  return {
    mtn: {
      name: 'MTN Mobile Money',
      apiUrl: 'https://sandbox.momodeveloper.mtn.com',
      sandboxUrl: 'https://sandbox.momodeveloper.mtn.com',
      apiKey: process.env.MTN_API_KEY || '',
      apiSecret: process.env.MTN_API_SECRET || '',
      environment: (process.env.MTN_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      webhookSecret: process.env.MTN_WEBHOOK_SECRET || '',
      supportedCurrencies: ['XAF', 'GHS', 'UGX', 'RWF', 'ZMW', 'XOF', 'USD'],
      supportedCountries: ['CM', 'GH', 'UG', 'RW', 'ZM', 'CI', 'BJ', 'GN', 'LR', 'SS', 'SZ', 'AF'],
    },
    orange: {
      name: 'Orange Money',
      apiUrl: 'https://api.orange.com',
      sandboxUrl: 'https://api.orange.com/sandbox',
      apiKey: process.env.ORANGE_API_KEY || '',
      apiSecret: process.env.ORANGE_API_SECRET || '',
      environment: (process.env.ORANGE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      webhookSecret: process.env.ORANGE_WEBHOOK_SECRET || '',
      supportedCurrencies: ['XAF', 'XOF', 'USD', 'EUR'],
      supportedCountries: ['CM', 'CI', 'ML', 'SN', 'BF', 'NE', 'MG', 'CD', 'GN', 'SL', 'LR', 'CF', 'TD', 'EG', 'JO'],
    },
  };
};