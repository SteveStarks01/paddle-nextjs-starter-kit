import { db } from '../index';
import { schools, departments, specialties, feeStructures } from '../schema';
import { eq, and } from 'drizzle-orm';

export class SchoolQueries {
  // Get school with all related data
  static async getSchoolWithDetails(schoolId: string) {
    return await db.query.schools.findFirst({
      where: eq(schools.id, schoolId),
      with: {
        departments: {
          with: {
            specialties: true,
          },
        },
      },
    });
  }

  // Get all active schools
  static async getActiveSchools() {
    return await db.query.schools.findMany({
      where: eq(schools.isActive, true),
      with: {
        departments: {
          where: eq(departments.isActive, true),
        },
      },
    });
  }

  // Create new school
  static async createSchool(schoolData: typeof schools.$inferInsert) {
    const [newSchool] = await db.insert(schools).values(schoolData).returning();
    return newSchool;
  }

  // Update school
  static async updateSchool(schoolId: string, updates: Partial<typeof schools.$inferInsert>) {
    const [updatedSchool] = await db
      .update(schools)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schools.id, schoolId))
      .returning();
    return updatedSchool;
  }

  // Get fee structures for specialty
  static async getFeeStructuresForSpecialty(specialtyId: string, academicYear: string) {
    return await db.query.feeStructures.findMany({
      where: and(
        eq(feeStructures.specialtyId, specialtyId),
        eq(feeStructures.academicYear, academicYear),
        eq(feeStructures.isActive, 'true')
      ),
    });
  }
}