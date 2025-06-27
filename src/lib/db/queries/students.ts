import { db } from '../index';
import { studentEnrollments, paymentPlans, feePayments } from '../schema';
import { eq, and } from 'drizzle-orm';

export class StudentQueries {
  // Get student enrollments with related data
  static async getStudentEnrollments(studentUserId: string) {
    return await db.query.studentEnrollments.findMany({
      where: eq(studentEnrollments.studentUserId, studentUserId),
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
    });
  }

  // Get payment plans for student
  static async getPaymentPlans(enrollmentId: string) {
    return await db.query.paymentPlans.findMany({
      where: eq(paymentPlans.enrollmentId, enrollmentId),
      with: {
        payments: true,
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
  }

  // Create student enrollment
  static async createEnrollment(enrollmentData: typeof studentEnrollments.$inferInsert) {
    const [newEnrollment] = await db.insert(studentEnrollments).values(enrollmentData).returning();
    return newEnrollment;
  }

  // Create payment plan
  static async createPaymentPlan(paymentPlanData: typeof paymentPlans.$inferInsert) {
    const [newPaymentPlan] = await db.insert(paymentPlans).values(paymentPlanData).returning();
    return newPaymentPlan;
  }

  // Record payment
  static async recordPayment(paymentData: typeof feePayments.$inferInsert) {
    const [newPayment] = await db.insert(feePayments).values(paymentData).returning();
    
    // Update payment plan
    const totalPaid = await db.query.feePayments.findMany({
      where: eq(feePayments.paymentPlanId, paymentData.paymentPlanId),
    });
    
    const totalAmount = totalPaid.reduce((sum, payment) => 
      sum + parseFloat(payment.amount), 0
    );
    
    await db
      .update(paymentPlans)
      .set({ 
        paidAmount: totalAmount.toString(),
        updatedAt: new Date(),
      })
      .where(eq(paymentPlans.id, paymentData.paymentPlanId));
    
    return newPayment;
  }
}