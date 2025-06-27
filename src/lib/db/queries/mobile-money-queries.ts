import { db } from '../index';
import { mobileMoneyTransactions, feePayments } from '../schema';
import { eq, and, desc } from 'drizzle-orm';

export class MobileMoneyQueries {
  /**
   * Create mobile money transaction record
   */
  static async createTransaction(transactionData: typeof mobileMoneyTransactions.$inferInsert) {
    const [newTransaction] = await db.insert(mobileMoneyTransactions).values(transactionData).returning();
    return newTransaction;
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(
    gatewayTransactionId: string, 
    status: string, 
    gatewayResponse?: string
  ) {
    const [updatedTransaction] = await db
      .update(mobileMoneyTransactions)
      .set({
        status,
        gatewayResponse,
        webhookReceived: true,
        updatedAt: new Date(),
      })
      .where(eq(mobileMoneyTransactions.gatewayTransactionId, gatewayTransactionId))
      .returning();

    return updatedTransaction;
  }

  /**
   * Get transaction by gateway transaction ID
   */
  static async getTransactionByGatewayId(gatewayTransactionId: string) {
    return await db.query.mobileMoneyTransactions.findFirst({
      where: eq(mobileMoneyTransactions.gatewayTransactionId, gatewayTransactionId),
      with: {
        feePayment: {
          with: {
            paymentPlan: {
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
            },
          },
        },
      },
    });
  }

  /**
   * Get student's mobile money transactions
   */
  static async getStudentTransactions(studentUserId: string) {
    return await db
      .select({
        transaction: mobileMoneyTransactions,
        payment: feePayments,
      })
      .from(mobileMoneyTransactions)
      .leftJoin(feePayments, eq(feePayments.id, mobileMoneyTransactions.feePaymentId))
      .leftJoin(paymentPlans, eq(paymentPlans.id, feePayments.paymentPlanId))
      .leftJoin(studentEnrollments, eq(studentEnrollments.id, paymentPlans.enrollmentId))
      .where(eq(studentEnrollments.studentUserId, studentUserId))
      .orderBy(desc(mobileMoneyTransactions.createdAt));
  }
}