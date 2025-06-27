import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';

export const schools = pgTable('schools', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  logoUrl: text('logo_url'),
  adminUserId: uuid('admin_user_id').references(() => users.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const specialties = pgTable('specialties', {
  id: uuid('id').primaryKey().defaultRandom(),
  departmentId: uuid('department_id').notNull().references(() => departments.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  description: text('description'),
  durationYears: text('duration_years').default('1'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const schoolsRelations = relations(schools, ({ one, many }) => ({
  admin: one(users, {
    fields: [schools.adminUserId],
    references: [users.id],
  }),
  departments: many(departments),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  school: one(schools, {
    fields: [departments.schoolId],
    references: [schools.id],
  }),
  specialties: many(specialties),
}));

export const specialtiesRelations = relations(specialties, ({ one }) => ({
  department: one(departments, {
    fields: [specialties.departmentId],
    references: [departments.id],
  }),
}));

export type School = typeof schools.$inferSelect;
export type NewSchool = typeof schools.$inferInsert;
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type Specialty = typeof specialties.$inferSelect;
export type NewSpecialty = typeof specialties.$inferInsert;