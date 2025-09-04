import { pgTable, uuid, varchar, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user";

export const addressTypePgEnum = pgEnum("address_type", ["billing", "shipping"]);
export const addressTypeEnum = ["billing", "shipping"] as const;

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: addressTypePgEnum("type").notNull(),
  line1: varchar("line1", { length: 255 }).notNull(),
  line2: varchar("line2", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  isDefault: boolean("is_default").notNull().default(false),
});

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(user, {
    fields: [addresses.userId],
    references: [user.id],
  }),
}));

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
