import { pgTable, uuid, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const sizes = pgTable("sizes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  sortOrder: integer("sort_order").notNull(),
});

export const sizesRelations = relations(sizes, () => ({}));

export type Size = typeof sizes.$inferSelect;
export type NewSize = typeof sizes.$inferInsert;
