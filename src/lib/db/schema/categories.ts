import { pgTable, uuid, varchar, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    parentId: uuid("parent_id"),
  },
  (t) => ({
    fkParent: foreignKey({
      columns: [t.parentId],
      foreignColumns: [t.id],
      name: "categories_parent_id_fk",
    }),
  })
);

export const categoriesRelations = relations(categories, ({ one }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
