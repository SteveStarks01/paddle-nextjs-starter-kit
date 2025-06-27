import { db } from '../index';
import { superAdminUsers, auditLogs } from '../schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

export class AdminQueries {
  // Get super admin user
  static async getSuperAdminUser(userId: string) {
    return await db.query.superAdminUsers.findFirst({
      where: and(
        eq(superAdminUsers.userId, userId),
        eq(superAdminUsers.isActive, true)
      ),
    });
  }

  // Create audit log
  static async createAuditLog(logData: typeof auditLogs.$inferInsert) {
    const [newLog] = await db.insert(auditLogs).values(logData).returning();
    return newLog;
  }

  // Get audit logs with filters
  static async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    resourceType?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }) {
    let query = db.query.auditLogs.findMany({
      orderBy: [desc(auditLogs.createdAt)],
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    });

    // Apply filters (you would build this dynamically)
    return await query;
  }

  // Get system analytics
  static async getSystemAnalytics() {
    // This would involve complex queries across multiple tables
    // You can use Drizzle's raw SQL for complex analytics
    const result = await db.execute(`
      SELECT 
        COUNT(DISTINCT s.id) as total_schools,
        COUNT(DISTINCT se.id) as total_students,
        COALESCE(SUM(fp.amount::numeric), 0) as total_revenue
      FROM schools s
      LEFT JOIN departments d ON s.id = d.school_id
      LEFT JOIN specialties sp ON d.id = sp.department_id
      LEFT JOIN student_enrollments se ON sp.id = se.specialty_id
      LEFT JOIN payment_plans pp ON se.id = pp.enrollment_id
      LEFT JOIN fee_payments fp ON pp.id = fp.payment_plan_id
      WHERE s.is_active = true
    `);
    
    return result.rows[0];
  }
}