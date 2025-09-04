import { pgTable, uuid, timestamp, numeric, varchar, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user";
import { addresses } from "./addresses";
import { productVariants } from "./variants";

export const orderStatusPgEnum = pgEnum("order_status", ["pending", "paid", "shipped", "delivered", "cancelled"]);
export const orderStatusEnum = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => user.id),
  status: orderStatusPgEnum("status").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddressId: uuid("shipping_address_id").notNull().references(() => addresses.id),
  billingAddressId: uuid("billing_address_id").notNull().references(() => addresses.id),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productVariantId: uuid("product_variant_id").notNull().references(() => productVariants.id),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: numeric("price_at_purchase", { precision: 10, scale: 2 }).notNull(),
});

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
  }),
  billingAddress: one(addresses, {
    fields: [orders.billingAddressId],
    references: [addresses.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  productVariant: one(productVariants, {
    fields: [orderItems.productVariantId],
    references: [productVariants.id],
  }),
}));

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
