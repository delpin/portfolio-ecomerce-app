"use server";

import { db } from "@/lib/db";
import {
  carts,
  cartItems,
  products,
  productVariants,
  productImages,
  colors,
  sizes,
} from "@/lib/db/schema";
import { and, eq, sql, inArray } from "drizzle-orm";
import {
  getCurrentUser,
  createGuestSession,
  guestSession,
} from "@/lib/auth/actions";

export type CartLineDTO = {
  id: string;
  cartId: string;
  productId: string;
  productName: string;
  variantId: string;
  colorName: string | null;
  colorHex?: string | null;
  sizeName: string | null;
  quantity: number;
  unitPrice: number; // already coalesced sale/base
  imageUrl: string | null;
};

export type CartDTO = {
  id: string;
  items: CartLineDTO[];
  subtotal: number;
};

async function getOrCreateActiveCart(): Promise<
  { cartId: string } & (
    | { kind: "user"; userId: string }
    | { kind: "guest"; guestId: string }
  )
> {
  const user = await getCurrentUser();
  if (user?.id) {
    const existing = await db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, user.id))
      .limit(1);
    if (existing[0]?.id) {
      return { cartId: existing[0].id, kind: "user", userId: user.id } as const;
    }
    const inserted = await db
      .insert(carts)
      .values({ userId: user.id })
      .returning({ id: carts.id });
    return { cartId: inserted[0].id, kind: "user", userId: user.id } as const;
  }

  const { sessionToken } = await guestSession();
  const token = sessionToken ?? (await createGuestSession()).sessionToken;
  const existing = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.guestId, token))
    .limit(1);
  if (existing[0]?.id) {
    return { cartId: existing[0].id, kind: "guest", guestId: token } as const;
  }
  const inserted = await db
    .insert(carts)
    .values({ guestId: token })
    .returning({ id: carts.id });
  return { cartId: inserted[0].id, kind: "guest", guestId: token } as const;
}

async function buildCartDTO(cartId: string): Promise<CartDTO> {
  const priceExpr = sql`COALESCE(${productVariants.salePrice}, ${productVariants.price})`;

  // 1) Берём строки корзины без присоединения изображений, чтобы избежать дубликатов
  const rows = await db
    .select({
      id: cartItems.id,
      cartId: cartItems.cartId,
      variantId: cartItems.productVariantId,
      quantity: cartItems.quantity,
      productId: products.id,
      productName: products.name,
      unitPrice: priceExpr,
      colorName: colors.name,
      colorHex: colors.hexCode,
      sizeName: sizes.name,
    })
    .from(cartItems)
    .leftJoin(
      productVariants,
      eq(productVariants.id, cartItems.productVariantId)
    )
    .leftJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(colors, eq(colors.id, productVariants.colorId))
    .leftJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .where(eq(cartItems.cartId, cartId));

  const variantIds = rows.map((r) => r.variantId).filter(Boolean) as string[];
  const productIds = Array.from(
    new Set(rows.map((r) => r.productId).filter(Boolean) as string[])
  );

  // 2) Карты изображений: сначала по variantId, затем фолбек по productId (primary)
  const imageByVariant = new Map<string, string>();
  if (variantIds.length) {
    const vImgs = await db
      .select({
        variantId: productImages.variantId,
        url: productImages.url,
        isPrimary: productImages.isPrimary,
        sortOrder: productImages.sortOrder,
      })
      .from(productImages)
      .where(inArray(productImages.variantId, variantIds));
    for (const img of vImgs) {
      const key = (img.variantId as unknown as string) ?? "";
      if (!key || imageByVariant.has(key)) continue;
      if (img.url) imageByVariant.set(key, img.url);
    }
  }

  const primaryByProduct = new Map<string, string>();
  if (productIds.length) {
    const pImgs = await db
      .select({
        productId: productImages.productId,
        url: productImages.url,
        isPrimary: productImages.isPrimary,
        sortOrder: productImages.sortOrder,
      })
      .from(productImages)
      .where(inArray(productImages.productId, productIds));
    for (const img of pImgs) {
      const key = (img.productId as unknown as string) ?? "";
      if (!key || primaryByProduct.has(key)) continue;
      if (img.url) primaryByProduct.set(key, img.url);
    }
  }

  const items: CartLineDTO[] = rows.map((r) => ({
    id: r.id,
    cartId: r.cartId,
    productId: r.productId as string,
    productName: r.productName ?? "",
    variantId: r.variantId,
    colorName: r.colorName ?? null,
    colorHex: r.colorHex ?? null,
    sizeName: r.sizeName ?? null,
    quantity: r.quantity ?? 1,
    unitPrice: Number(r.unitPrice ?? 0),
    imageUrl:
      imageByVariant.get(r.variantId) ??
      primaryByProduct.get(r.productId as string) ??
      null,
  }));

  const subtotal = items.reduce(
    (acc, it) => acc + it.unitPrice * it.quantity,
    0
  );
  return { id: cartId, items, subtotal };
}

export async function getCart(): Promise<CartDTO> {
  const { cartId } = await getOrCreateActiveCart();
  return buildCartDTO(cartId);
}

export async function addCartItem(
  variantId: string,
  quantity: number = 1
): Promise<CartDTO> {
  const { cartId } = await getOrCreateActiveCart();

  const exists = await db
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cartId, cartId),
        eq(cartItems.productVariantId, variantId)
      )
    )
    .limit(1);

  if (exists[0]?.id) {
    await db
      .update(cartItems)
      .set({ quantity: (exists[0].quantity ?? 0) + Math.max(1, quantity) })
      .where(eq(cartItems.id, exists[0].id));
  } else {
    await db.insert(cartItems).values({
      cartId,
      productVariantId: variantId,
      quantity: Math.max(1, quantity),
    });
  }

  return buildCartDTO(cartId);
}

export async function updateCartItem(params: {
  itemId: string;
  quantity?: number;
  newVariantId?: string;
}): Promise<CartDTO> {
  const { itemId, quantity, newVariantId } = params;
  const { cartId } = await getOrCreateActiveCart();

  if (newVariantId) {
    // если уже есть строка с этим вариантом, смёрджим количество
    const target = await db
      .select({ id: cartItems.id, quantity: cartItems.quantity })
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartId),
          eq(cartItems.productVariantId, newVariantId)
        )
      )
      .limit(1);

    const current = await db
      .select({ id: cartItems.id, quantity: cartItems.quantity })
      .from(cartItems)
      .where(eq(cartItems.id, itemId))
      .limit(1);

    if (target[0]?.id) {
      const mergedQty =
        (target[0].quantity ?? 0) + (quantity ?? current[0]?.quantity ?? 1);
      await db
        .update(cartItems)
        .set({ quantity: mergedQty })
        .where(eq(cartItems.id, target[0].id));
      await db.delete(cartItems).where(eq(cartItems.id, itemId));
    } else {
      await db
        .update(cartItems)
        .set({
          productVariantId: newVariantId,
          quantity: quantity ?? undefined,
        })
        .where(eq(cartItems.id, itemId));
    }
  } else if (typeof quantity === "number") {
    const next = Math.max(1, quantity);
    await db
      .update(cartItems)
      .set({ quantity: next })
      .where(eq(cartItems.id, itemId));
  }

  return buildCartDTO(cartId);
}

export async function removeCartItem(itemId: string): Promise<CartDTO> {
  const { cartId } = await getOrCreateActiveCart();
  await db.delete(cartItems).where(eq(cartItems.id, itemId));
  return buildCartDTO(cartId);
}

export async function clearCart(): Promise<CartDTO> {
  const { cartId } = await getOrCreateActiveCart();
  const ids = await db
    .select({ id: cartItems.id })
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));
  if (ids.length) {
    await db.delete(cartItems).where(
      inArray(
        cartItems.id,
        ids.map((r) => r.id)
      )
    );
  }
  return buildCartDTO(cartId);
}

export async function mergeGuestCartIntoUserCart(params?: {
  userId?: string;
  guestToken?: string;
}) {
  // Опциональные явные параметры, иначе автоматически определим
  let userId = params?.userId;
  let guestToken = params?.guestToken;
  const user = await getCurrentUser();
  if (!userId) userId = user?.id || undefined;
  if (!userId) return { ok: false as const, reason: "no-user" };

  if (!guestToken) {
    const { sessionToken } = await guestSession();
    guestToken = sessionToken || undefined;
  }
  if (!guestToken) return { ok: true as const, merged: false };

  const guestCart = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.guestId, guestToken))
    .limit(1);
  if (!guestCart[0]?.id) return { ok: true as const, merged: false };

  const userCartExisting = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);
  const userCartId =
    userCartExisting[0]?.id ||
    (await db.insert(carts).values({ userId }).returning({ id: carts.id }))[0]
      .id;

  const guestItems = await db
    .select({
      id: cartItems.id,
      variantId: cartItems.productVariantId,
      quantity: cartItems.quantity,
    })
    .from(cartItems)
    .where(eq(cartItems.cartId, guestCart[0].id));

  if (guestItems.length) {
    const existing = await db
      .select({
        id: cartItems.id,
        variantId: cartItems.productVariantId,
        quantity: cartItems.quantity,
      })
      .from(cartItems)
      .where(eq(cartItems.cartId, userCartId));
    const byVariant = new Map(existing.map((r) => [r.variantId, r] as const));

    for (const gi of guestItems) {
      const e = byVariant.get(gi.variantId);
      if (e) {
        await db
          .update(cartItems)
          .set({ quantity: (e.quantity ?? 0) + (gi.quantity ?? 0) })
          .where(eq(cartItems.id, e.id));
        await db.delete(cartItems).where(eq(cartItems.id, gi.id));
      } else {
        await db
          .update(cartItems)
          .set({ cartId: userCartId })
          .where(eq(cartItems.id, gi.id));
      }
    }
  }

  // удаляем гостевую корзину
  await db.delete(carts).where(eq(carts.id, guestCart[0].id));
  return { ok: true as const, merged: true };
}
