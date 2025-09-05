"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, CartItemState } from "@/store/cart.store";
import { useRouter } from "next/navigation";
// no server imports here

export default function CartClient({
  initialCart,
  isAuthenticated,
}: {
  initialCart: { id: string; items: CartItemState[]; subtotal: number };
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const store = useCartStore();
  const initialized = React.useRef(false);

  React.useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    // Заполняем стор начальными данными, затем обновляем с сервера для консистентности
    if (initialCart) {
      useCartStore.setState({
        id: initialCart.id,
        items: initialCart.items,
        subtotal: initialCart.subtotal,
      });
    }
    void store.fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = store.items;
  const subtotal = store.subtotal;

  const shipping = items.length ? 2 : 0; // фиктивная стоимость доставки как в макете
  const total = subtotal + shipping;

  const onCheckout = async () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    router.push("/checkout"); // страница чекаута вне скоупа — редирект-заглушка
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      <section>
        <h1 className="text-dark-900 leading-[var(--display-lg--line-height)] font-[var(--display-lg--font-weight)] mb-6">
          Cart
        </h1>

        <div className="space-y-8">
          {items.map((it) => (
            <CartRow key={it.id} item={it} />
          ))}
          {!items.length ? (
            <div className="text-dark-700">
              Your cart is empty.{" "}
              <Link className="underline" href="/products">
                Continue shopping
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <aside className="h-fit rounded-xl border border-light-300 bg-light-100 p-6">
        <h2 className="mb-4 leading-[var(--display-sm--line-height)] font-[var(--display-sm--font-weight)] text-dark-900">
          Summary
        </h2>
        <div className="space-y-3 text-dark-900">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Estimated Delivery & Handling</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <hr className="my-3 border-light-300" />
          <div className="flex items-center justify-between font-medium">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={onCheckout}
          className="mt-6 w-full h-12 rounded-full bg-dark-900 text-light-100 hover:bg-dark-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
        >
          Proceed to Checkout
        </button>
      </aside>
    </main>
  );
}

function CartRow({ item }: { item: CartItemState }) {
  const store = useCartStore();
  const inc = () => store.updateQty(item.id, item.quantity + 1);
  const dec = () => store.updateQty(item.id, Math.max(1, item.quantity - 1));
  const remove = () => store.remove(item.id);

  return (
    <div className="grid grid-cols-[96px_1fr_auto] gap-4 items-start">
      <div className="relative w-24 h-24 rounded-md overflow-hidden bg-light-200">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="space-y-1">
        <div className="text-dark-900 font-medium">{item.productName}</div>
        <div className="text-dark-700 leading-[var(--text-footnote--line-height)]">
          {item.colorName ? `${item.colorName}` : ""}{" "}
          {item.sizeName ? `· Size ${item.sizeName}` : ""}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-dark-900">Quantity</span>
          <div className="inline-flex items-center gap-2 rounded-full border border-light-300 px-3 py-1">
            <button
              aria-label="Decrease"
              onClick={dec}
              className="p-1 text-dark-900 hover:text-dark-700"
            >
              <Minus size={16} />
            </button>
            <span aria-live="polite" className="min-w-4 text-center">
              {item.quantity}
            </span>
            <button
              aria-label="Increase"
              onClick={inc}
              className="p-1 text-dark-900 hover:text-dark-700"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            aria-label="Remove"
            onClick={remove}
            className="p-1 text-red-600 hover:text-red-700"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="text-right text-dark-900">
        ${(item.unitPrice * item.quantity).toFixed(2)}
      </div>
    </div>
  );
}
