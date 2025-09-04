import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const genders = pgTable("genders", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: varchar("label", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
});

export const gendersRelations = relations(genders, () => ({}));

export type Gender = typeof genders.$inferSelect;
export type NewGender = typeof genders.$inferInsert;
