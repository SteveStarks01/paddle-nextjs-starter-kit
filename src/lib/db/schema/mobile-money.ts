import { pgTable, uuid, text, timestamp, decimal, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { feePayments } from './payments';

export const mobileMoneyTransactions = pgTable('mobile_money_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  feePaymentId: uuid('fee_payment_id').references(() => feePayments.id),
  gatewayProvider: text('gateway_provider').notNull(), // 'mtn' or 'orange'
  gatewayTransactionId: text('gateway_transaction_id').notNull(),
  phoneNumber: text('phone_number').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull(),
  status: text('status').notNull().default('pending'),
  gatewayResponse: text('gateway_response'), // JSON string
  webhookReceived: boolean('webhook_received').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const mobileMoneyTransactionsRelations = relations(mobileMoneyTransactions, ({ one }) => ({
  feePayment: one(feePayments, {
    fields: [mobileMoneyTransactions.feePaymentId],
    references: [feePayments.id],
  }),
}));

export type MobileMoneyTransaction = typeof mobileMoneyTransactions.$inferSelect;
export type NewMobileMoneyTransaction = typeof mobileMoneyTransactions.$inferInsert;