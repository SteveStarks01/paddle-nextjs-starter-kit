import { PaymentGatewayFactory } from './gateway-factory';
import { getPaymentGatewayConfigs } from './config';

/**
 * Initialize payment gateways on application startup
 */
export function initializePaymentGateways() {
  try {
    const configs = getPaymentGatewayConfigs();
    PaymentGatewayFactory.initialize(configs);
    console.log('✅ Payment gateways initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize payment gateways:', error);
  }
}