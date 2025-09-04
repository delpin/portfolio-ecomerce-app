import { db } from "../src/lib/db";
import {
  brands,
  genders,
  colors,
  sizes,
  categories,
  collections,
  products,
  productVariants,
  productImages,
  productCollections,
} from "../src/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const uploadBase = path.join(process.cwd(), "static", "uploads", "shoes");
const publicShoes = path.join(process.cwd(), "public", "shoes");

const nikeBrand = { name: "Nike", slug: "nike", logoUrl: null as string | null };

const baseGenders = [
  { label: "Men", slug: "men" },
  { label: "Women", slug: "women" },
  { label: "Kids", slug: "kids" },
];

const baseColors = [
  { name: "Black", slug: "black", hexCode: "#000000" },
  { name: "White", slug: "white", hexCode: "#FFFFFF" },
  { name: "Red", slug: "red", hexCode: "#FF0000" },
  { name: "Blue", slug: "blue", hexCode: "#0000FF" },
  { name: "Green", slug: "green", hexCode: "#00FF00" },
];

const baseSizes = [
  { name: "7", slug: "7", sortOrder: 1 },
  { name: "8", slug: "8", sortOrder: 2 },
  { name: "9", slug: "9", sortOrder: 3 },
  { name: "10", slug: "10", sortOrder: 4 },
  { name: "11", slug: "11", sortOrder: 5 },
];

const baseCategories = [
  { name: "Shoes", slug: "shoes" },
  { name: "Apparel", slug: "apparel" },
  { name: "Accessories", slug: "accessories" },
];

const baseCollections = [
  { name: "Summer '25", slug: "summer-25" },
  { name: "Essentials", slug: "essentials" },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function ensureUploads() {
  await fs.mkdir(uploadBase, { recursive: true });
  const files = await fs.readdir(publicShoes);
  const copied: string[] = [];
  for (const f of files) {
    const src = path.join(publicShoes, f);
    const dest = path.join(uploadBase, f);
    try {
      await fs.copyFile(src, dest);
      copied.push(dest);
    } catch {}
  }
  return copied;
}

async function seed() {
  try {
    console.log("Seeding database...");

    await ensureUploads();

    const [brand] = await db
      .insert(brands)
      .values(nikeBrand)
      .onConflictDoNothing()
      .returning({ id: brands.id });

    const genderRows = await db
      .insert(genders)
      .values(baseGenders)
      .onConflictDoNothing()
      .returning({ id: genders.id, slug: genders.slug });
    const colorRows = await db
      .insert(colors)
      .values(baseColors)
      .onConflictDoNothing()
      .returning({ id: colors.id, slug: colors.slug });
    const sizeRows = await db
      .insert(sizes)
      .values(baseSizes)
      .onConflictDoNothing()
      .returning({ id: sizes.id, slug: sizes.slug, sortOrder: sizes.sortOrder });
    const categoryRows = await db
      .insert(categories)
      .values(baseCategories)
      .onConflictDoNothing()
      .returning({ id: categories.id, slug: categories.slug });
    const collectionRows = await db
      .insert(collections)
      .values(baseCollections)
      .onConflictDoNothing()
      .returning({ id: collections.id, slug: collections.slug });

    const brandId =
      brand?.id ??
      (await db.select().from(brands).where(eq(brands.slug, "nike"))).at(0)?.id;

    if (!brandId) {
      throw new Error("Failed to resolve Nike brand id");
    }

    const uploaded = await fs.readdir(uploadBase);

    const createdProductIds: string[] = [];

    for (let i = 0; i < 15; i++) {
      const g = pickRandom(genderRows.length ? genderRows : await db.select().from(genders));
      const c = pickRandom(categoryRows.length ? categoryRows : await db.select().from(categories));

      const name = `Nike ${["Air", "React", "Zoom", "Pegasus", "Invincible", "Structure"][i % 6]} ${100 + i}`;
      const description = `High-performance Nike ${c.slug} engineered for comfort and durability. Variant ${i + 1}.`;

      const [p] = await db
        .insert(products)
        .values({
          name,
          description,
          categoryId: c.id,
          genderId: g.id,
          brandId,
          isPublished: true,
        })
        .returning({ id: products.id });

      createdProductIds.push(p.id);

      const chosenColors = Array.from(new Set(Array.from({ length: 2 + (i % 2) }, () => pickRandom(colorRows)))).slice(0, 3);
      const chosenSizes = sizeRows;

      const variantIds: string[] = [];
      for (const color of chosenColors) {
        for (const size of chosenSizes) {
          const sku = `NIKE-${i + 1}-${color.slug}-${size.slug}-${randomUUID().slice(0, 6).toUpperCase()}`;
          const basePrice = 90 + (i % 8) * 10;
          const price = basePrice.toFixed(2);
          const salePrice = i % 3 === 0 ? (basePrice - 10).toFixed(2) : null;

          const [v] = await db
            .insert(productVariants)
            .values({
              productId: p.id,
              sku,
              price,
              salePrice: salePrice ?? undefined,
              colorId: color.id,
              sizeId: size.id,
              inStock: 5 + (i % 10),
              weight: 0.85,
              dimensions: { length: 30, width: 20, height: 12 },
            })
            .returning({ id: productVariants.id });

          variantIds.push(v.id);

          const picks = Array.from(
            new Set(
              Array.from({ length: 1 + (i % 2) }, () => pickRandom(uploaded))
            )
          );

          let sort = 0;
          for (const fname of picks) {
            await db.insert(productImages).values({
              productId: p.id,
              variantId: v.id,
              url: `/static/uploads/shoes/${fname}`,
              sortOrder: sort++,
              isPrimary: sort === 1,
            });
          }
        }
      }

      if (variantIds.length) {
        await db
          .update(products)
          .set({ defaultVariantId: variantIds[0] })
          .where(eq(products.id, p.id));
      }

      const chosenCollections = collectionRows.slice(0, 1 + (i % 2));
      for (const col of chosenCollections) {
        await db
          .insert(productCollections)
          .values({ productId: p.id, collectionId: col.id })
          .onConflictDoNothing();
      }
    }

    console.log(`Seed complete. Products: ${createdProductIds.length}`);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
