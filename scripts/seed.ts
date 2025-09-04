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
import { eq } from "drizzle-orm";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const publicShoes = path.join(process.cwd(), "public", "shoes");

const nikeBrand = {
  name: "Nike",
  slug: "nike",
  logoUrl: null as string | null,
};

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
  // Исторически копировали в static/uploads; сейчас достаточно
  // использовать файлы прямо из public/shoes, которые доступны по URL /shoes/*.
  // Функцию оставляем для совместимости и потенциального логирования.
  try {
    await fs.access(publicShoes);
  } catch {
    throw new Error(`Images source directory not found: ${publicShoes}`);
  }
  return [] as string[];
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

    let genderRows = await db
      .insert(genders)
      .values(baseGenders)
      .onConflictDoNothing()
      .returning({ id: genders.id, slug: genders.slug });
    if (!genderRows.length) {
      genderRows = await db
        .select({ id: genders.id, slug: genders.slug })
        .from(genders);
    }

    let colorRows = await db
      .insert(colors)
      .values(baseColors)
      .onConflictDoNothing()
      .returning({ id: colors.id, slug: colors.slug });
    if (!colorRows.length) {
      colorRows = await db
        .select({ id: colors.id, slug: colors.slug })
        .from(colors);
    }

    let sizeRows = await db
      .insert(sizes)
      .values(baseSizes)
      .onConflictDoNothing()
      .returning({
        id: sizes.id,
        slug: sizes.slug,
        sortOrder: sizes.sortOrder,
      });
    if (!sizeRows.length) {
      sizeRows = await db
        .select({ id: sizes.id, slug: sizes.slug, sortOrder: sizes.sortOrder })
        .from(sizes);
    }

    let categoryRows = await db
      .insert(categories)
      .values(baseCategories)
      .onConflictDoNothing()
      .returning({ id: categories.id, slug: categories.slug });
    if (!categoryRows.length) {
      categoryRows = await db
        .select({ id: categories.id, slug: categories.slug })
        .from(categories);
    }

    let collectionRows = await db
      .insert(collections)
      .values(baseCollections)
      .onConflictDoNothing()
      .returning({ id: collections.id, slug: collections.slug });
    if (!collectionRows.length) {
      collectionRows = await db
        .select({ id: collections.id, slug: collections.slug })
        .from(collections);
    }

    const brandId =
      brand?.id ??
      (await db.select().from(brands).where(eq(brands.slug, "nike"))).at(0)?.id;

    if (!brandId) {
      throw new Error("Failed to resolve Nike brand id");
    }

    // Берём доступные публичные изображения из public/shoes
    const allFiles = await fs.readdir(publicShoes);
    const uploaded = allFiles.filter(
      (f) => !f.startsWith(".") && /\.(png|jpe?g|webp|avif)$/i.test(f)
    );
    if (!uploaded.length) {
      throw new Error(
        `No images found in ${publicShoes}. Ensure shoe images exist.`
      );
    }

    const createdProductIds: string[] = [];

    for (let i = 0; i < 15; i++) {
      const g = pickRandom(
        genderRows.length ? genderRows : await db.select().from(genders)
      );
      const c = pickRandom(
        categoryRows.length ? categoryRows : await db.select().from(categories)
      );

      const name = `Nike ${
        ["Air", "React", "Zoom", "Pegasus", "Invincible", "Structure"][i % 6]
      } ${100 + i}`;
      const description = `High-performance Nike ${
        c.slug
      } engineered for comfort and durability. Variant ${i + 1}.`;

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

      const chosenColorsRaw = Array.from(
        new Set(
          Array.from({ length: 2 + (i % 2) }, () => pickRandom(colorRows))
        )
      ).slice(0, 3);
      const chosenColors = chosenColorsRaw.length
        ? chosenColorsRaw
        : [colorRows[0]];
      const chosenSizes = sizeRows;

      const variantIds: string[] = [];
      for (const color of chosenColors) {
        for (const size of chosenSizes) {
          const sku = `NIKE-${i + 1}-${color.slug}-${size.slug}-${randomUUID()
            .slice(0, 6)
            .toUpperCase()}`;
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

          const picksRaw = Array.from(
            new Set(
              Array.from({ length: 1 + (i % 2) }, () => pickRandom(uploaded))
            )
          );
          const picks = picksRaw.length ? picksRaw : [uploaded[0]];

          let sort = 0;
          for (const fname of picks) {
            await db.insert(productImages).values({
              productId: p.id,
              variantId: v.id,
              // Храним URL, раздаваемый из public: /shoes/<file>
              url: `/shoes/${fname}`,
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
