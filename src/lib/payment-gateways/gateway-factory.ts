import { MTNMobileMoneyGateway } from './mtn-mobile-money';
import { OrangeMoneyGateway } from './orange-money';
import { PaymentGateway, PaymentGatewayConfig } from './types';

export type SupportedGateway = 'mtn' | 'orange';

export class PaymentGatewayFactory {
  private static gateways: Map<SupportedGateway, PaymentGateway> = new Map();

  /**
   * Initialize payment gateways with configuration
   */
  static initialize(configs: Record<SupportedGateway, PaymentGatewayConfig>) {
    // Initialize MTN Mobile Money
    if (configs.mtn) {
      this.gateways.set('mtn', new MTNMobileMoneyGateway(configs.mtn));
    }

    // Initialize Orange Money
    if (configs.orange) {
      this.gateways.set('orange', new OrangeMoneyGateway(configs.orange));
    }
  }

  /**
   * Get payment gateway instance
   */
  static getGateway(gatewayName: SupportedGateway): PaymentGateway {
    const gateway = this.gateways.get(gatewayName);
    if (!gateway) {
      throw new Error(`Payment gateway '${gatewayName}' not initialized`);
    }
    return gateway;
  }

  /**
   * Get all available gateways
   */
  static getAllGateways(): PaymentGateway[] {
    return Array.from(this.gateways.values());
  }

  /**
   * Check if gateway is available
   */
  static isGatewayAvailable(gatewayName: SupportedGateway): boolean {
    return this.gateways.has(gatewayName);
  }

  /**
   * Get gateway for specific country/currency
   */
  static getGatewayForCountry(countryCode: string, currency: string): PaymentGateway[] {
    const availableGateways: PaymentGateway[] = [];

    for (const gateway of this.gateways.values()) {
      // This would check gateway configuration for supported countries/currencies
      // For now, we'll use a simple mapping
      if (this.isGatewaySupportedInCountry(gateway.name, countryCode, currency)) {
        availableGateways.push(gateway);
      }
    }

    return availableGateways;
  }

  /**
   * Check if gateway supports country/currency
   */
  private static isGatewaySupportedInCountry(gatewayName: string, countryCode: string, currency: string): boolean {
    const supportMatrix = {
      'MTN Mobile Money': {
        countries: ['CM', 'GH', 'UG', 'RW', 'ZM', 'CI', 'BJ', 'GN', 'LR', 'SS', 'SZ', 'AF'],
        currencies: ['XAF', 'GHS', 'UGX', 'RWF', 'ZMW', 'XOF', 'USD'],
      },
      'Orange Money': {
        countries: ['CM', 'CI', 'ML', 'SN', 'BF', 'NE', 'MG', 'CD', 'GN', 'SL', 'LR', 'CF', 'TD', 'EG', 'JO'],
        currencies: ['XAF', 'XOF', 'USD', 'EUR'],
      },
    };

    const gateway = supportMatrix[gatewayName];
    return gateway && 
           gateway.countries.includes(countryCode) && 
           gateway.currencies.includes(currency);
  }
}