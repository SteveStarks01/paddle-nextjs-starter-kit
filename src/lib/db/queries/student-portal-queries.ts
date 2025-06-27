import { db } from '../index';
import { studentEnrollments, paymentPlans, feePayments, specialties, departments, schools } from '../schema';
import { eq, and, desc, sum } from 'drizzle-orm';

export class StudentPortalQueries {
  /**
   * Get student dashboard data
   */
  static async getStudentDashboard(studentUserId: string) {
    const enrollments = await db.query.studentEnrollments.findMany({
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

    const paymentSummary = await db
      .select({
        totalDue: sum(paymentPlans.totalAmount),
        totalPaid: sum(paymentPlans.paidAmount),
        totalOutstanding: sum(paymentPlans.outstandingAmount),
      })
      .from(paymentPlans)
      .leftJoin(studentEnrollments, eq(studentEnrollments.id, paymentPlans.enrollmentId))
      .where(eq(studentEnrollments.studentUserId, studentUserId))
      .groupBy(studentEnrollments.studentUserId);

    return {
      enrollments,
      paymentSummary: paymentSummary[0] || {
        totalDue: '0',
        totalPaid: '0',
        totalOutstanding: '0',
      },
    };
  }

  /**
   * Get payment history for student
   */
  static async getPaymentHistory(studentUserId: string) {
    return await db
      .select({
        paymentId: feePayments.id,
        amount: feePayments.amount,
        paymentDate: feePayments.paymentDate,
        paymentMethod: feePayments.paymentMethod,
        status: feePayments.status,
        receiptUrl: feePayments.receiptUrl,
        schoolName: schools.name,
        specialtyName: specialties.name,
      })
      .from(feePayments)
      .leftJoin(paymentPlans, eq(paymentPlans.id, feePayments.paymentPlanId))
      .leftJoin(studentEnrollments, eq(studentEnrollments.id, paymentPlans.enrollmentId))
      .leftJoin(specialties, eq(specialties.id, studentEnrollments.specialtyId))
      .leftJoin(departments, eq(departments.id, specialties.departmentId))
      .leftJoin(schools, eq(schools.id, departments.schoolId))
      .where(eq(studentEnrollments.studentUserId, studentUserId))
      .orderBy(desc(feePayments.paymentDate));
  }

  /**
   * Get upcoming payment schedules
   */
  static async getUpcomingPayments(studentUserId: string) {
    return await db
      .select({
        planId: paymentPlans.id,
        dueDate: paymentPlans.dueDate,
        outstandingAmount: paymentPlans.outstandingAmount,
        installmentAmount: paymentPlans.installmentAmount,
        schoolName: schools.name,
        specialtyName: specialties.name,
      })
      .from(paymentPlans)
      .leftJoin(studentEnrollments, eq(studentEnrollments.id, paymentPlans.enrollmentId))
      .leftJoin(specialties, eq(specialties.id, studentEnrollments.specialtyId))
      .leftJoin(departments, eq(departments.id, specialties.departmentId))
      .leftJoin(schools, eq(schools.id, departments.schoolId))
      .where(and(
        eq(studentEnrollments.studentUserId, studentUserId),
        eq(paymentPlans.status, 'active')
      ))
      .orderBy(paymentPlans.dueDate);
  }
}