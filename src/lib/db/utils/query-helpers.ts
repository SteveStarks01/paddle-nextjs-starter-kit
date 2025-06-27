import { db } from '../index';
import { sql } from 'drizzle-orm';

export class QueryHelpers {
  /**
   * Execute raw SQL for complex analytics
   */
  static async executeRawQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
    const result = await db.execute(sql.raw(query, params));
    return result.rows as T[];
  }

  /**
   * Get table row counts
   */
  static async getTableCounts() {
    const counts = await db.execute(sql`
      SELECT 
        'schools' as table_name, COUNT(*) as count FROM schools
      UNION ALL
      SELECT 
        'students' as table_name, COUNT(*) as count FROM student_enrollments
      UNION ALL
      SELECT 
        'payments' as table_name, COUNT(*) as count FROM fee_payments
    `);
    
    return counts.rows.reduce((acc, row) => {
      acc[row.table_name] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Health check for database connection
   */
  static async healthCheck() {
    try {
      await db.execute(sql`SELECT 1`);
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date() };
    }
  }
}