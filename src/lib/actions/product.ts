"use server";

import { db } from "@/lib/db";
import { and, asc, countDistinct, desc, eq, ilike, inArray, sql, between, gte, lte, or } from "drizzle-orm";
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

export async function getAllProducts(filters: ProductListFilters): Promise<ProductListResult> {
  const page = Math.max(1, Number(filters.page || 1));
  const limit = Math.min(60, Math.max(1, Number(filters.limit || 24)));
  const offset = (page - 1) * limit;

  const priceExpr = sql<number>`COALESCE(${productVariants.salePrice}, ${productVariants.price})`;
  type AndArg = Parameters<typeof and>[0];
  const whereClauses: AndArg[] = [
    eq(products.isPublished, true),
    filters.search ? or(ilike(products.name, `%${filters.search}%`), ilike(products.description, `%${filters.search}%`)) : undefined,
    filters.brandIds && filters.brandIds.length ? inArray(products.brandId, filters.brandIds) : undefined,
    filters.categoryIds && filters.categoryIds.length ? inArray(products.categoryId, filters.categoryIds) : undefined,
    filters.genderIds && filters.genderIds.length ? inArray(genders.slug, filters.genderIds) : undefined,
    filters.colorIds && filters.colorIds.length ? inArray(colors.slug, filters.colorIds) : undefined,
    filters.sizeIds && filters.sizeIds.length ? inArray(sizes.slug, filters.sizeIds) : undefined,
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
      ? [asc(sql`MIN(${priceExpr})`), desc(products.createdAt), asc(products.id)]
      : sortBy === "price_desc"
      ? [desc(sql`MIN(${priceExpr})`), desc(products.createdAt), asc(products.id)]
      : [desc(products.createdAt), asc(products.id)];

  const rows = await baseQuery.orderBy(...orderBy).limit(limit).offset(offset);

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
  variants: ProductVariantDTO[];
  images: { id: string; url: string; isPrimary: boolean; sortOrder: number; variantId: string | null }[];
};

export async function getProduct(productId: string): Promise<ProductDetail | null> {
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
  const imagesMap = new Map<string, { id: string; url: string; isPrimary: boolean; sortOrder: number; variantId: string | null }>();

  for (const r of rows) {
    if (r.v_id && !variantsMap.has(r.v_id)) {
      variantsMap.set(r.v_id, {
        id: r.v_id,
        sku: r.v_sku ?? "",
        price: String(r.v_price),
        salePrice: r.v_salePrice ? String(r.v_salePrice) : null,
        colorId: r.v_colorId ?? "",
        colorName: r.v_colorName ?? null,
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
    variants: Array.from(variantsMap.values()),
    images: Array.from(imagesMap.values()).sort((a, b) => (a.isPrimary === b.isPrimary ? a.sortOrder - b.sortOrder : a.isPrimary ? -1 : 1)),
  };
}
