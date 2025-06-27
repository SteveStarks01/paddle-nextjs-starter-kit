import { db } from '../index';
import { schools, departments, specialties, studentEnrollments, paymentPlans, feePayments } from '../schema';
import { eq, and, desc, count, sum, avg } from 'drizzle-orm';

export class EnhancedSchoolQueries {
  /**
   * Get comprehensive school analytics
   */
  static async getSchoolAnalytics(schoolId: string) {
    const analytics = await db
      .select({
        schoolName: schools.name,
        totalStudents: count(studentEnrollments.id),
        totalRevenue: sum(feePayments.amount),
        averagePayment: avg(feePayments.amount),
        departmentCount: count(departments.id),
      })
      .from(schools)
      .leftJoin(departments, eq(departments.schoolId, schools.id))
      .leftJoin(specialties, eq(specialties.departmentId, departments.id))
      .leftJoin(studentEnrollments, eq(studentEnrollments.specialtyId, specialties.id))
      .leftJoin(paymentPlans, eq(paymentPlans.enrollmentId, studentEnrollments.id))
      .leftJoin(feePayments, eq(feePayments.paymentPlanId, paymentPlans.id))
      .where(eq(schools.id, schoolId))
      .groupBy(schools.id, schools.name);

    return analytics[0];
  }

  /**
   * Get school enrollment trends
   */
  static async getEnrollmentTrends(schoolId: string, academicYear: string) {
    return await db
      .select({
        departmentName: departments.name,
        specialtyName: specialties.name,
        enrollmentCount: count(studentEnrollments.id),
        activeStudents: count(studentEnrollments.id),
      })
      .from(departments)
      .leftJoin(specialties, eq(specialties.departmentId, departments.id))
      .leftJoin(studentEnrollments, and(
        eq(studentEnrollments.specialtyId, specialties.id),
        eq(studentEnrollments.academicYear, academicYear)
      ))
      .where(eq(departments.schoolId, schoolId))
      .groupBy(departments.id, departments.name, specialties.id, specialties.name)
      .orderBy(desc(count(studentEnrollments.id)));
  }

  /**
   * Get payment status overview
   */
  static async getPaymentStatusOverview(schoolId: string) {
    return await db
      .select({
        totalDue: sum(paymentPlans.totalAmount),
        totalPaid: sum(paymentPlans.paidAmount),
        totalOutstanding: sum(paymentPlans.outstandingAmount),
        completedPlans: count(paymentPlans.id),
      })
      .from(schools)
      .leftJoin(departments, eq(departments.schoolId, schools.id))
      .leftJoin(specialties, eq(specialties.departmentId, departments.id))
      .leftJoin(studentEnrollments, eq(studentEnrollments.specialtyId, specialties.id))
      .leftJoin(paymentPlans, eq(paymentPlans.enrollmentId, studentEnrollments.id))
      .where(eq(schools.id, schoolId))
      .groupBy(schools.id);
  }

  /**
   * Get recent student registrations
   */
  static async getRecentRegistrations(schoolId: string, limit: number = 10) {
    return await db.query.studentEnrollments.findMany({
      where: eq(studentEnrollments.specialtyId, specialties.id),
      with: {
        specialty: {
          with: {
            department: {
              where: eq(departments.schoolId, schoolId),
            },
          },
        },
      },
      orderBy: [desc(studentEnrollments.createdAt)],
      limit,
    });
  }
}