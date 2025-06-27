import { db } from '../index';
import { schools, studentEnrollments, feePayments, superAdminUsers, auditLogs } from '../schema';
import { eq, desc, count, sum, avg, gte, and } from 'drizzle-orm';

export class SuperAdminQueries {
  /**
   * Get platform-wide analytics
   */
  static async getPlatformAnalytics() {
    const totalSchools = await db
      .select({ count: count() })
      .from(schools)
      .where(eq(schools.isActive, true));

    const totalStudents = await db
      .select({ count: count() })
      .from(studentEnrollments)
      .where(eq(studentEnrollments.status, 'active'));

    const revenueStats = await db
      .select({
        totalRevenue: sum(feePayments.amount),
        averagePayment: avg(feePayments.amount),
        transactionCount: count(feePayments.id),
      })
      .from(feePayments)
      .where(eq(feePayments.status, 'completed'));

    const monthlyRevenue = await db
      .select({
        month: feePayments.paymentDate,
        revenue: sum(feePayments.amount),
      })
      .from(feePayments)
      .where(and(
        eq(feePayments.status, 'completed'),
        gte(feePayments.paymentDate, new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000))
      ))
      .groupBy(feePayments.paymentDate)
      .orderBy(desc(feePayments.paymentDate));

    return {
      totalSchools: totalSchools[0]?.count || 0,
      totalStudents: totalStudents[0]?.count || 0,
      ...revenueStats[0],
      monthlyRevenue,
    };
  }

  /**
   * Get top performing schools
   */
  static async getTopPerformingSchools(limit: number = 10) {
    return await db
      .select({
        schoolId: schools.id,
        schoolName: schools.name,
        studentCount: count(studentEnrollments.id),
        totalRevenue: sum(feePayments.amount),
        averageRevenue: avg(feePayments.amount),
      })
      .from(schools)
      .leftJoin(departments, eq(departments.schoolId, schools.id))
      .leftJoin(specialties, eq(specialties.departmentId, departments.id))
      .leftJoin(studentEnrollments, eq(studentEnrollments.specialtyId, specialties.id))
      .leftJoin(paymentPlans, eq(paymentPlans.enrollmentId, studentEnrollments.id))
      .leftJoin(feePayments, eq(feePayments.paymentPlanId, paymentPlans.id))
      .where(eq(schools.isActive, true))
      .groupBy(schools.id, schools.name)
      .orderBy(desc(sum(feePayments.amount)))
      .limit(limit);
  }

  /**
   * Get recent system activity
   */
  static async getRecentActivity(limit: number = 50) {
    return await db.query.auditLogs.findMany({
      orderBy: [desc(auditLogs.createdAt)],
      limit,
    });
  }

  /**
   * Get school approval metrics
   */
  static async getSchoolApprovalMetrics() {
    // This would query your school_approvals table
    // Implementation depends on your approval workflow
    return {
      pendingApprovals: 0,
      approvedThisMonth: 0,
      rejectedThisMonth: 0,
    };
  }
}