import { pgTable, uuid, text, timestamp, decimal, date, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';
import { specialties } from './schools';

export const studentEnrollments = pgTable('student_enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentUserId: uuid('student_user_id').notNull().references(() => users.id),
  specialtyId: uuid('specialty_id').notNull().references(() => specialties.id),
  feeStructureId: uuid('fee_structure_id').notNull(),
  studentId: text('student_id').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  enrollmentDate: date('enrollment_date').defaultNow(),
  academicYear: text('academic_year').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const feeStructures = pgTable('fee_structures', {
  id: uuid('id').primaryKey().defaultRandom(),
  specialtyId: uuid('specialty_id').notNull().references(() => specialties.id, { onDelete: 'cascade' }),
  academicYear: text('academic_year').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  allowsInstallments: text('allows_installments').default('true'),
  maxInstallments: integer('max_installments').default(4),
  lateFeePercentage: decimal('late_fee_percentage', { precision: 5, scale: 2 }).default('5.00'),
  isActive: text('is_active').default('true'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const studentEnrollmentsRelations = relations(studentEnrollments, ({ one }) => ({
  student: one(users, {
    fields: [studentEnrollments.studentUserId],
    references: [users.id],
  }),
  specialty: one(specialties, {
    fields: [studentEnrollments.specialtyId],
    references: [specialties.id],
  }),
}));

export type StudentEnrollment = typeof studentEnrollments.$inferSelect;
export type NewStudentEnrollment = typeof studentEnrollments.$inferInsert;
export type FeeStructure = typeof feeStructures.$inferSelect;
export type NewFeeStructure = typeof feeStructures.$inferInsert;