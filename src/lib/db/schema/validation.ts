import { z } from "zod";
import { addressTypeEnum as addressTypeValues } from "./addresses";
import { orderStatusEnum as orderStatusValues } from "./orders";
import { paymentMethodEnum as paymentMethodValues, paymentStatusEnum as paymentStatusValues } from "./payments";
import { discountTypeEnum as discountTypeValues } from "./coupons";

export const id = z.string().uuid();
export const timestamp = z.date();

export const addressTypeEnum = z.enum(addressTypeValues);
export const orderStatusEnum = z.enum(orderStatusValues);
export const paymentMethodEnum = z.enum(paymentMethodValues);
export const paymentStatusEnum = z.enum(paymentStatusValues);
export const discountTypeEnum = z.enum(discountTypeValues);

export const brandInsert = z.object({
  id: id.optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  logoUrl: z.string().url().optional().nullable(),
});
export const brandSelect = brandInsert.extend({ id });

export const genderInsert = z.object({
  id: id.optional(),
  label: z.string().min(1),
  slug: z.string().min(1),
});
export const genderSelect = genderInsert.extend({ id });

export const colorInsert = z.object({
  id: id.optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  hexCode: z.string().regex(/^#([0-9a-fA-F]{6})$/),
});
export const colorSelect = colorInsert.extend({ id });

export const sizeInsert = z.object({
  id: id.optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  sortOrder: z.number().int(),
});
export const sizeSelect = sizeInsert.extend({ id });

export const categoryInsert = z.object({
  id: id.optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: id.optional().nullable(),
});
export const categorySelect = categoryInsert.extend({ id });

export const collectionInsert = z.object({
  id: id.optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  createdAt: z.date().optional(),
});
export const collectionSelect = collectionInsert.extend({ id });

export const productInsert = z.object({
  id: id.optional(),
  name: z.string().min(1),
  description: z.string().min(1),
  categoryId: id,
  genderId: id,
  brandId: id,
  isPublished: z.boolean().optional(),
  defaultVariantId: id.optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export const productSelect = productInsert.extend({ id });

export const productVariantInsert = z.object({
  id: id.optional(),
  productId: id,
  sku: z.string().min(1),
  price: z.string(), // Drizzle numeric -> string
  salePrice: z.string().optional().nullable(),
  colorId: id,
  sizeId: id,
  inStock: z.number().int().nonnegative(),
  weight: z.number(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  createdAt: z.date().optional(),
});
export const productVariantSelect = productVariantInsert.extend({ id });

export const productImageInsert = z.object({
  id: id.optional(),
  productId: id,
  variantId: id.optional().nullable(),
  url: z.string().min(1),
  sortOrder: z.number().int().optional(),
  isPrimary: z.boolean().optional(),
});
export const productImageSelect = productImageInsert.extend({ id });

export const addressInsert = z.object({
  id: id.optional(),
  userId: id,
  type: addressTypeEnum,
  line1: z.string().min(1),
  line2: z.string().optional().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  postalCode: z.string().min(1),
  isDefault: z.boolean().optional(),
});
export const addressSelect = addressInsert.extend({ id });

export const reviewInsert = z.object({
  id: id.optional(),
  productId: id,
  userId: id,
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().nullable(),
  createdAt: z.date().optional(),
});
export const reviewSelect = reviewInsert.extend({ id });

export const cartInsert = z.object({
  id: id.optional(),
  userId: id.optional().nullable(),
  guestId: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export const cartSelect = cartInsert.extend({ id });

export const cartItemInsert = z.object({
  id: id.optional(),
  cartId: id,
  productVariantId: id,
  quantity: z.number().int().positive(),
});
export const cartItemSelect = cartItemInsert.extend({ id });

export const orderInsert = z.object({
  id: id.optional(),
  userId: id,
  status: orderStatusEnum,
  totalAmount: z.string(),
  shippingAddressId: id,
  billingAddressId: id,
  createdAt: z.date().optional(),
});
export const orderSelect = orderInsert.extend({ id });

export const orderItemInsert = z.object({
  id: id.optional(),
  orderId: id,
  productVariantId: id,
  quantity: z.number().int().positive(),
  priceAtPurchase: z.string(),
});
export const orderItemSelect = orderItemInsert.extend({ id });

export const paymentInsert = z.object({
  id: id.optional(),
  orderId: id,
  method: paymentMethodEnum,
  status: paymentStatusEnum,
  paidAt: z.date().optional().nullable(),
  transactionId: z.string().optional().nullable(),
});
export const paymentSelect = paymentInsert.extend({ id });

export const couponInsert = z.object({
  id: id.optional(),
  code: z.string().min(1),
  discountType: discountTypeEnum,
  discountValue: z.string(),
  expiresAt: z.date().optional().nullable(),
  maxUsage: z.number().int().nonnegative(),
  usedCount: z.number().int().nonnegative().optional(),
});
export const couponSelect = couponInsert.extend({ id });

export const wishlistInsert = z.object({
  id: id.optional(),
  userId: id,
  productId: id,
  addedAt: z.date().optional(),
});
export const wishlistSelect = wishlistInsert.extend({ id });

export const productCollectionInsert = z.object({
  id: id.optional(),
  productId: id,
  collectionId: id,
});
export const productCollectionSelect = productCollectionInsert.extend({ id });
