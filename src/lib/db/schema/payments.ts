import { pgTable, uuid, text, timestamp, decimal, date, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { studentEnrollments } from './students';

export const paymentPlans = pgTable('payment_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  enrollmentId: uuid('enrollment_id').notNull().references(() => studentEnrollments.id, { onDelete: 'cascade' }),
  planType: text('plan_type').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 10, scale: 2 }).default('0'),
  outstandingAmount: decimal('outstanding_amount', { precision: 10, scale: 2 }).notNull(),
  numberOfInstallments: integer('number_of_installments').default(1),
  installmentAmount: decimal('installment_amount', { precision: 10, scale: 2 }),
  dueDate: date('due_date'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const feePayments = pgTable('fee_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  paymentPlanId: uuid('payment_plan_id').notNull().references(() => paymentPlans.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').notNull(),
  transactionId: text('transaction_id'),
  paymentDate: timestamp('payment_date').defaultNow(),
  status: text('status').default('completed'),
  receiptUrl: text('receipt_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const paymentPlansRelations = relations(paymentPlans, ({ one, many }) => ({
  enrollment: one(studentEnrollments, {
    fields: [paymentPlans.enrollmentId],
    references: [studentEnrollments.id],
  }),
  payments: many(feePayments),
}));

export const feePaymentsRelations = relations(feePayments, ({ one }) => ({
  paymentPlan: one(paymentPlans, {
    fields: [feePayments.paymentPlanId],
    references: [paymentPlans.id],
  }),
}));

export type PaymentPlan = typeof paymentPlans.$inferSelect;
export type NewPaymentPlan = typeof paymentPlans.$inferInsert;
export type FeePayment = typeof feePayments.$inferSelect;
export type NewFeePayment = typeof feePayments.$inferInsert;