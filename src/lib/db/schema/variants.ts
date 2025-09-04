import { pgTable, uuid, varchar, numeric, integer, real, jsonb, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./products";
import { colors } from "./filters/colors";
import { sizes } from "./filters/sizes";

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sku: varchar("sku", { length: 100 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
  colorId: uuid("color_id").notNull().references(() => colors.id),
  sizeId: uuid("size_id").notNull().references(() => sizes.id),
  inStock: integer("in_stock").notNull().default(0),
  weight: real("weight").notNull(),
  dimensions: jsonb("dimensions").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (table) => {
  return {
    skuUnique: uniqueIndex("product_variants_sku_unique").on(table.sku),
  };
});

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  color: one(colors, {
    fields: [productVariants.colorId],
    references: [colors.id],
  }),
  size: one(sizes, {
    fields: [productVariants.sizeId],
    references: [sizes.id],
  }),
}));

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
