import { z } from "zod";

export const addressTypeEnum = z.enum(["billing", "shipping"]);
export const orderStatusEnum = z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]);
export const paymentMethodEnum = z.enum(["stripe", "paypal", "cod"]);
export const paymentStatusEnum = z.enum(["initiated", "completed", "failed"]);
export const discountTypeEnum = z.enum(["percentage", "fixed"]);

export const idSchema = z.string().uuid();
export const uuidSchema = idSchema;
