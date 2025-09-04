import { pgTable, uuid, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { orders } from "./orders";

export const paymentMethodPgEnum = pgEnum("payment_method", ["stripe", "paypal", "cod"]);
export const paymentStatusPgEnum = pgEnum("payment_status", ["initiated", "completed", "failed"]);
export const paymentMethodEnum = ["stripe", "paypal", "cod"] as const;
export const paymentStatusEnum = ["initiated", "completed", "failed"] as const;

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  method: paymentMethodPgEnum("method").notNull(),
  status: paymentStatusPgEnum("status").notNull(),
  paidAt: timestamp("paid_at", { mode: "date" }),
  transactionId: varchar("transaction_id", { length: 255 }),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
