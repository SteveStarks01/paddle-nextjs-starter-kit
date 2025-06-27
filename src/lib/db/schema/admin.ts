import { pgTable, uuid, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';

export const superAdminUsers = pgTable('super_admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: text('role').default('super_admin'),
  permissions: jsonb('permissions').default([]),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  userEmail: text('user_email'),
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id'),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  sessionId: text('session_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const superAdminUsersRelations = relations(superAdminUsers, ({ one }) => ({
  user: one(users, {
    fields: [superAdminUsers.userId],
    references: [users.id],
  }),
}));

export type SuperAdminUser = typeof superAdminUsers.$inferSelect;
export type NewSuperAdminUser = typeof superAdminUsers.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;