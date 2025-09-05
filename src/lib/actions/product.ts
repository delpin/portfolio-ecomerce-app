"use server";

import { db } from "@/lib/db";
import {
  and,
  asc,
  countDistinct,
  desc,
  eq,
  ilike,
  inArray,
  sql,
  between,
  gte,
  lte,
  or,
} from "drizzle-orm";
import { products } from "@/lib/db/schema/products";
import { productVariants } from "@/lib/db/schema/variants";
import { productImages } from "@/lib/db/schema/images";
import { brands } from "@/lib/db/schema/brands";
import { categories } from "@/lib/db/schema/categories";
import { genders } from "@/lib/db/schema/filters/genders";
import { colors } from "@/lib/db/schema/filters/colors";
import { sizes } from "@/lib/db/schema/filters/sizes";

export type SortBy = "latest" | "price_asc" | "price_desc";
export type ProductListFilters = {
  search?: string;
  brandIds?: string[];
  categoryIds?: string[];
  genderIds?: string[];
  colorIds?: string[];
  sizeIds?: string[];
  priceMin?: number;
  priceMax?: number;
  sortBy?: SortBy;
  page?: number;
  limit?: number;
};

export type ProductListItem = {
  id: string;
  title: string;
  subtitle?: string;
  price?: number | null;
  imageSrc: string | null;
  colorsCount?: number;
  createdAt: Date;
};

export type ProductListResult = {
  products: ProductListItem[];
  totalCount: number;
};

export async function getAllProducts(
  filters: ProductListFilters
): Promise<ProductListResult> {
  const page = Math.max(1, Number(filters.page || 1));
  const limit = Math.min(60, Math.max(1, Number(filters.limit || 24)));
  const offset = (page - 1) * limit;

  const priceExpr = sql<number>`COALESCE(${productVariants.salePrice}, ${productVariants.price})`;
  type AndArg = Parameters<typeof and>[0];
  const whereClauses: AndArg[] = [
    eq(products.isPublished, true),
    filters.search
      ? or(
          ilike(products.name, `%${filters.search}%`),
          ilike(products.description, `%${filters.search}%`)
        )
      : undefined,
    filters.brandIds && filters.brandIds.length
      ? inArray(products.brandId, filters.brandIds)
      : undefined,
    filters.categoryIds && filters.categoryIds.length
      ? inArray(products.categoryId, filters.categoryIds)
      : undefined,
    filters.genderIds && filters.genderIds.length
      ? inArray(genders.slug, filters.genderIds)
      : undefined,
    filters.colorIds && filters.colorIds.length
      ? inArray(colors.slug, filters.colorIds)
      : undefined,
    filters.sizeIds && filters.sizeIds.length
      ? inArray(sizes.slug, filters.sizeIds)
      : undefined,
    typeof filters.priceMin === "number" && typeof filters.priceMax === "number"
      ? between(priceExpr, filters.priceMin, filters.priceMax)
      : typeof filters.priceMin === "number"
      ? gte(priceExpr, filters.priceMin)
      : typeof filters.priceMax === "number"
      ? lte(priceExpr, filters.priceMax)
      : undefined,
  ].filter(Boolean) as AndArg[];

  const baseQuery = db
    .select({
      id: products.id,
      name: products.name,
      createdAt: products.createdAt,
      genderName: genders.label,
      minPrice: sql<number | null>`MIN(${priceExpr})`,
      maxPrice: sql<number | null>`MAX(${priceExpr})`,
      colorsCount: countDistinct(productVariants.colorId),
    })
    .from(products)
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(genders, eq(genders.id, products.genderId))
    .leftJoin(colors, eq(colors.id, productVariants.colorId))
    .leftJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .where(and(...whereClauses))
    .groupBy(products.id, products.name, products.createdAt, genders.label);

  const sortBy = (filters.sortBy as SortBy) || "latest";
  const orderBy =
    sortBy === "price_asc"
      ? [
          asc(sql`MIN(${priceExpr})`),
          desc(products.createdAt),
          asc(products.id),
        ]
      : sortBy === "price_desc"
      ? [
          desc(sql`MIN(${priceExpr})`),
          desc(products.createdAt),
          asc(products.id),
        ]
      : [desc(products.createdAt), asc(products.id)];

  const rows = await baseQuery
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset);

  const countQuery = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${products.id})` })
    .from(products)
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(genders, eq(genders.id, products.genderId))
    .leftJoin(colors, eq(colors.id, productVariants.colorId))
    .leftJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .where(and(...whereClauses));

  const totalCount = countQuery[0]?.count ?? 0;

  const ids = rows.map((r) => r.id);
  const imageByProduct = new Map<string, string>();
  if (ids.length) {
    const imgs = await db
      .select({
        productId: productImages.productId,
        url: productImages.url,
        isPrimary: productImages.isPrimary,
        sortOrder: productImages.sortOrder,
      })
      .from(productImages)
      .where(inArray(productImages.productId, ids))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder));
    for (const img of imgs) {
      if (!imageByProduct.has(img.productId)) {
        imageByProduct.set(img.productId, img.url);
      }
    }
  }

  const items: ProductListItem[] = rows.map((r) => ({
    id: r.id,
    title: r.name,
    subtitle: r.genderName ? `${r.genderName} Shoes` : undefined,
    price: r.minPrice,
    imageSrc: imageByProduct.get(r.id) ?? null,
    colorsCount: Number(r.colorsCount) || 0,
    createdAt: r.createdAt,
  }));

  return { products: items, totalCount };
}

export type ProductVariantDTO = {
  id: string;
  sku: string;
  price: string;
  salePrice: string | null;
  colorId: string;
  colorName: string | null;
  colorHex?: string | null;
  sizeId: string;
  sizeName: string | null;
  inStock: number;
  weight: number;
  dimensions: unknown;
};

export type ProductDetail = {
  id: string;
  name: string;
  description: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  brandId: string;
  brandName: string | null;
  categoryId: string;
  categoryName: string | null;
  genderId: string;
  genderName: string | null;
  /** минимальная цена среди вариантов (учитывая скидку) */
  price: number | null;
  /** сравнимая цена (обычная цена, если есть скидка) */
  compareAtPrice: number | null;
  variants: ProductVariantDTO[];
  images: {
    id: string;
    url: string;
    isPrimary: boolean;
    sortOrder: number;
    variantId: string | null;
  }[];
  /** сгруппированные изображения по variantId; ключ "default" для общих изображений без variantId */
  imagesByVariant: Record<string, string[]>;
};

export async function getProduct(
  productId: string
): Promise<ProductDetail | null> {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      isPublished: products.isPublished,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      brandId: products.brandId,
      brandName: brands.name,
      categoryId: products.categoryId,
      categoryName: categories.name,
      genderId: products.genderId,
      genderName: genders.label,
      v_id: productVariants.id,
      v_sku: productVariants.sku,
      v_price: productVariants.price,
      v_salePrice: productVariants.salePrice,
      v_colorId: productVariants.colorId,
      v_colorName: colors.name,
      v_sizeId: productVariants.sizeId,
      v_sizeName: sizes.name,
      v_inStock: productVariants.inStock,
      v_weight: productVariants.weight,
      v_dimensions: productVariants.dimensions,
      i_id: productImages.id,
      i_url: productImages.url,
      i_isPrimary: productImages.isPrimary,
      i_sortOrder: productImages.sortOrder,
      i_variantId: productImages.variantId,
      v_colorHex: colors.hexCode,
    })
    .from(products)
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(genders, eq(genders.id, products.genderId))
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(colors, eq(colors.id, productVariants.colorId))
    .leftJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .where(and(eq(products.id, productId), eq(products.isPublished, true)))
    .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder));

  if (!rows.length) return null;

  const head = rows[0];

  const variantsMap = new Map<string, ProductVariantDTO>();
  const imagesMap = new Map<
    string,
    {
      id: string;
      url: string;
      isPrimary: boolean;
      sortOrder: number;
      variantId: string | null;
    }
  >();

  for (const r of rows) {
    if (r.v_id && !variantsMap.has(r.v_id)) {
      variantsMap.set(r.v_id, {
        id: r.v_id,
        sku: r.v_sku ?? "",
        price: String(r.v_price),
        salePrice: r.v_salePrice ? String(r.v_salePrice) : null,
        colorId: r.v_colorId ?? "",
        colorName: r.v_colorName ?? null,
        colorHex: r.v_colorHex ?? null,
        sizeId: r.v_sizeId ?? "",
        sizeName: r.v_sizeName ?? null,
        inStock: r.v_inStock ?? 0,
        weight: r.v_weight ?? 0,
        dimensions: r.v_dimensions,
      });
    }
    if (r.i_id && !imagesMap.has(r.i_id)) {
      imagesMap.set(r.i_id, {
        id: r.i_id,
        url: r.i_url ?? "",
        isPrimary: Boolean(r.i_isPrimary),
        sortOrder: r.i_sortOrder ?? 0,
        variantId: r.i_variantId ?? null,
      });
    }
  }

  // вычисление цены и compare-at
  let minBasePrice: number | null = null;
  let minSalePrice: number | null = null;
  for (const v of variantsMap.values()) {
    const base = Number(v.price);
    const sale = v.salePrice != null ? Number(v.salePrice) : null;
    if (minBasePrice == null || base < minBasePrice) minBasePrice = base;
    if (sale != null && (minSalePrice == null || sale < minSalePrice))
      minSalePrice = sale;
  }

  const sortedImages = Array.from(imagesMap.values()).sort((a, b) =>
    a.isPrimary === b.isPrimary
      ? a.sortOrder - b.sortOrder
      : a.isPrimary
      ? -1
      : 1
  );

  // группировка изображений по цветам (для корректной работы свотчей)
  const imagesByVariant: Record<string, string[]> = {};
  const colorImagesSet: Record<string, Set<string>> = {};
  for (const img of sortedImages) {
    let key = "default";
    if (img.variantId) {
      const v = variantsMap.get(img.variantId);
      if (v?.colorId) key = v.colorId;
    }
    colorImagesSet[key] ||= new Set<string>();
    if (img.url) colorImagesSet[key].add(img.url);
  }
  for (const [k, set] of Object.entries(colorImagesSet)) {
    imagesByVariant[k] = Array.from(set);
  }

  return {
    id: head.id,
    name: head.name,
    description: head.description,
    isPublished: head.isPublished,
    createdAt: head.createdAt,
    updatedAt: head.updatedAt,
    brandId: head.brandId,
    brandName: head.brandName ?? null,
    categoryId: head.categoryId,
    categoryName: head.categoryName ?? null,
    genderId: head.genderId,
    genderName: head.genderName ?? null,
    price: minSalePrice ?? minBasePrice ?? null,
    compareAtPrice: minSalePrice != null ? minBasePrice : null,
    variants: Array.from(variantsMap.values()),
    images: sortedImages,
    imagesByVariant,
  };
}

export type ReviewDTO = {
  id: string;
  author: string;
  rating: number;
  title?: string;
  content: string;
  createdAt: string;
};

export type RecommendedProductDTO = {
  id: string;
  title: string;
  price: number | null;
  imageSrc: string;
};

export async function getProductReviews(
  productId: string
): Promise<ReviewDTO[]> {
  // Поскольку статус модерации в схеме отсутствует, возвращаем все отзывы продукта
  const { reviews } = await import("@/lib/db/schema/reviews");
  const { user } = await import("@/lib/db/schema/user");

  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      authorName: user.name,
    })
    .from(reviews)
    .leftJoin(user, eq(user.id, reviews.userId))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt))
    .limit(10);

  if (!rows.length) {
    // Fallback-дамми, если данных нет
    const now = new Date();
    return [
      {
        id: "dummy-1",
        author: "Anonymous",
        rating: 5,
        title: "Отлично",
        content: "Качество превзошло ожидания. Сидят идеально.",
        createdAt: now.toISOString(),
      },
      {
        id: "dummy-2",
        author: "Anonymous",
        rating: 4,
        title: "Хорошая покупка",
        content: "Удобные, стильные. Немного маломерят.",
        createdAt: new Date(now.getTime() - 86400000).toISOString(),
      },
    ];
  }

  return rows.map((r) => ({
    id: r.id,
    author: r.authorName ?? "Anonymous",
    rating: r.rating,
    title: undefined,
    content: r.comment ?? "",
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getRecommendedProducts(
  productId: string,
  limit = 6
): Promise<RecommendedProductDTO[]> {
  // получаем атрибуты исходного продукта
  const base = await db
    .select({
      id: products.id,
      categoryId: products.categoryId,
      brandId: products.brandId,
      genderId: products.genderId,
    })
    .from(products)
    .where(eq(products.id, productId));
  const head = base[0];
  if (!head) return [];

  const priceExpr = sql<number>`MIN(COALESCE(${productVariants.salePrice}, ${productVariants.price}))`;

  const candidateRows = await db
    .select({
      id: products.id,
      title: products.name,
      minPrice: priceExpr,
    })
    .from(products)
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .where(
      and(
        eq(products.isPublished, true),
        eq(products.categoryId, head.categoryId),
        eq(products.brandId, head.brandId),
        eq(products.genderId, head.genderId),
        sql`${products.id} <> ${productId}`
      )
    )
    .groupBy(products.id, products.name)
    .orderBy(desc(products.createdAt))
    .limit(limit * 2); // запас, чтобы отфильтровать без изображений

  if (!candidateRows.length) return [];

  const ids = candidateRows.map((r) => r.id);
  const images = await db
    .select({
      productId: productImages.productId,
      url: productImages.url,
      isPrimary: productImages.isPrimary,
      sortOrder: productImages.sortOrder,
    })
    .from(productImages)
    .where(inArray(productImages.productId, ids))
    .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder));

  const firstImageByProduct = new Map<string, string>();
  for (const img of images) {
    if (img.url && !firstImageByProduct.has(img.productId)) {
      firstImageByProduct.set(img.productId, img.url);
    }
  }

  const result: RecommendedProductDTO[] = [];
  for (const row of candidateRows) {
    const imageSrc = firstImageByProduct.get(row.id);
    if (!imageSrc) continue; // пропускаем товары без валидного изображения
    result.push({
      id: row.id,
      title: row.title,
      price: row.minPrice != null ? Number(row.minPrice) : null,
      imageSrc,
    });
    if (result.length >= limit) break;
  }

  return result;
}
