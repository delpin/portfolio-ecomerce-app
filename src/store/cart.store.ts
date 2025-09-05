"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/actions/cart";

export type CartItemState = {
  id: string;
  cartId: string;
  productId: string;
  productName: string;
  variantId: string;
  colorName: string | null;
  colorHex?: string | null;
  sizeName: string | null;
  quantity: number;
  unitPrice: number;
  imageUrl: string | null;
};

type CartState = {
  id: string | null;
  items: CartItemState[];
  subtotal: number;
  loading: boolean;
  fetch: () => Promise<void>;
  add: (variantId: string, qty?: number) => Promise<void>;
  updateQty: (itemId: string, qty: number) => Promise<void>;
  changeVariant: (itemId: string, newVariantId: string) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
};

export const useCartStore = create<CartState>()(
  immer((set) => ({
    id: null,
    items: [],
    subtotal: 0,
    loading: false,
    async fetch() {
      set((s) => void (s.loading = true));
      const data = await getCart();
      set((s) => {
        s.id = data.id;
        s.items = data.items;
        s.subtotal = data.subtotal;
        s.loading = false;
      });
    },
    async add(variantId, qty = 1) {
      set((s) => void (s.loading = true));
      const data = await addCartItem(variantId, qty);
      set((s) => {
        s.id = data.id;
        s.items = data.items;
        s.subtotal = data.subtotal;
        s.loading = false;
      });
    },
    async updateQty(itemId, qty) {
      set((s) => void (s.loading = true));
      const data = await updateCartItem({ itemId, quantity: qty });
      set((s) => {
        s.id = data.id;
        s.items = data.items;
        s.subtotal = data.subtotal;
        s.loading = false;
      });
    },
    async changeVariant(itemId, newVariantId) {
      set((s) => void (s.loading = true));
      const data = await updateCartItem({ itemId, newVariantId });
      set((s) => {
        s.id = data.id;
        s.items = data.items;
        s.subtotal = data.subtotal;
        s.loading = false;
      });
    },
    async remove(itemId) {
      set((s) => void (s.loading = true));
      const data = await removeCartItem(itemId);
      set((s) => {
        s.id = data.id;
        s.items = data.items;
        s.subtotal = data.subtotal;
        s.loading = false;
      });
    },
    async clear() {
      set((s) => void (s.loading = true));
      const data = await clearCart();
      set((s) => {
        s.id = data.id;
        s.items = data.items;
        s.subtotal = data.subtotal;
        s.loading = false;
      });
    },
  }))
);
