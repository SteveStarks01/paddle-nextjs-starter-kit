import { PaymentGatewayFactory, SupportedGateway } from './gateway-factory';
import { PaymentRequest, PaymentResponse } from './types';
import { db } from '../db';
import { feePayments, paymentPlans } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface MobileMoneyPaymentRequest {
  paymentPlanId: string;
  amount: number;
  currency: string;
  phoneNumber: string;
  gateway: SupportedGateway;
  studentInfo: {
    firstName: string;
    lastName: string;
    email: string;
    studentId: string;
  };
}

export class PaymentService {
  /**
   * Process mobile money payment
   */
  static async processMobileMoneyPayment(request: MobileMoneyPaymentRequest): Promise<PaymentResponse> {
    try {
      // Get payment gateway
      const gateway = PaymentGatewayFactory.getGateway(request.gateway);

      // Get payment plan details
      const paymentPlan = await db.query.paymentPlans.findFirst({
        where: eq(paymentPlans.id, request.paymentPlanId),
        with: {
          enrollment: {
            with: {
              specialty: {
                with: {
                  department: {
                    with: {
                      school: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!paymentPlan) {
        throw new Error('Payment plan not found');
      }

      // Create payment reference
      const reference = `SF-${paymentPlan.enrollment.specialty.department.school.code}-${request.studentInfo.studentId}-${Date.now()}`;

      // Prepare payment request
      const paymentRequest: PaymentRequest = {
        amount: request.amount,
        currency: request.currency,
        phoneNumber: request.phoneNumber,
        reference,
        description: `School fee payment for ${request.studentInfo.firstName} ${request.studentInfo.lastName}`,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mobile-money/${request.gateway}`,
        metadata: {
          paymentPlanId: request.paymentPlanId,
          studentId: request.studentInfo.studentId,
          email: request.studentInfo.email,
          firstName: request.studentInfo.firstName,
          lastName: request.studentInfo.lastName,
        },
      };

      // Initiate payment with gateway
      const response = await gateway.initiatePayment(paymentRequest);

      // Record payment attempt in database
      await db.insert(feePayments).values({
        paymentPlanId: request.paymentPlanId,
        amount: request.amount.toString(),
        paymentMethod: `mobile_money_${request.gateway}`,
        transactionId: response.transactionId,
        status: response.status === 'pending' ? 'pending' : 'failed',
        notes: `Mobile Money payment via ${gateway.name}`,
      });

      return response;
    } catch (error) {
      console.error('Payment processing failed:', error);
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        message: error.message || 'Payment processing failed',
      };
    }
  }

  /**
   * Verify payment status
   */
  static async verifyPayment(transactionId: string, gateway: SupportedGateway): Promise<PaymentResponse> {
    try {
      const gatewayInstance = PaymentGatewayFactory.getGateway(gateway);
      const response = await gatewayInstance.verifyPayment(transactionId);

      // Update payment status in database
      await db
        .update(feePayments)
        .set({
          status: response.status,
          updatedAt: new Date(),
        })
        .where(eq(feePayments.transactionId, transactionId));

      // If payment is completed, update payment plan
      if (response.status === 'completed') {
        await this.updatePaymentPlanOnSuccess(transactionId);
      }

      return response;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return {
        success: false,
        transactionId,
        status: 'failed',
        message: error.message || 'Payment verification failed',
      };
    }
  }

  /**
   * Update payment plan when payment is successful
   */
  private static async updatePaymentPlanOnSuccess(transactionId: string) {
    try {
      // Get payment record
      const payment = await db.query.feePayments.findFirst({
        where: eq(feePayments.transactionId, transactionId),
        with: {
          paymentPlan: true,
        },
      });

      if (!payment || !payment.paymentPlan) {
        return;
      }

      // Calculate new paid amount
      const newPaidAmount = parseFloat(payment.paymentPlan.paidAmount) + parseFloat(payment.amount);
      const newOutstandingAmount = parseFloat(payment.paymentPlan.totalAmount) - newPaidAmount;

      // Update payment plan
      await db
        .update(paymentPlans)
        .set({
          paidAmount: newPaidAmount.toString(),
          outstandingAmount: Math.max(0, newOutstandingAmount).toString(),
          status: newOutstandingAmount <= 0 ? 'completed' : 'active',
          updatedAt: new Date(),
        })
        .where(eq(paymentPlans.id, payment.paymentPlanId));

    } catch (error) {
      console.error('Failed to update payment plan:', error);
    }
  }

  /**
   * Get available payment methods for country
   */
  static getAvailablePaymentMethods(countryCode: string, currency: string): SupportedGateway[] {
    const availableGateways = PaymentGatewayFactory.getGatewayForCountry(countryCode, currency);
    return availableGateways.map(gateway => {
      if (gateway.name === 'MTN Mobile Money') return 'mtn';
      if (gateway.name === 'Orange Money') return 'orange';
      return 'mtn'; // fallback
    });
  }
}