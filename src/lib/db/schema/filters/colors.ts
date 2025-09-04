import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const colors = pgTable("colors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  hexCode: varchar("hex_code", { length: 7 }).notNull(),
});

export const colorsRelations = relations(colors, () => ({}));

export type Color = typeof colors.$inferSelect;
export type NewColor = typeof colors.$inferInsert;
