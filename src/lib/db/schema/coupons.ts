import { pgTable, uuid, varchar, numeric, timestamp, integer, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const discountTypePgEnum = pgEnum("discount_type", ["percentage", "fixed"]);
export const discountTypeEnum = ["percentage", "fixed"] as const;

export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 100 }).notNull(),
  discountType: discountTypePgEnum("discount_type").notNull(),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  maxUsage: integer("max_usage").notNull(),
  usedCount: integer("used_count").notNull().default(0),
}, (table) => {
  return {
    codeUnique: uniqueIndex("coupons_code_unique").on(table.code),
  };
});

export const couponsRelations = relations(coupons, () => ({}));

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
