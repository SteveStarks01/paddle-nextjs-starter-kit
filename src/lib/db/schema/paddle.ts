import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const customers = pgTable('customers', {
  customerId: text('customer_id').primaryKey(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  subscriptionId: text('subscription_id').primaryKey(),
  subscriptionStatus: text('subscription_status').notNull(),
  priceId: text('price_id'),
  productId: text('product_id'),
  scheduledChange: text('scheduled_change'),
  customerId: text('customer_id').notNull().references(() => customers.customerId),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;