"use client";

import React from "react";
import SizePicker from "./SizePicker";
import { useCartStore } from "@/store/cart.store";
import type { ProductDetail } from "@/lib/actions/product";

export default function AddToBag({
  product,
  sizes,
}: {
  product: ProductDetail;
  sizes: string[];
}) {
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = React.useState<
    string | null
  >(null);
  const { add, loading } = useCartStore();

  React.useEffect(() => {
    if (!selectedSize) {
      setSelectedVariantId(null);
      return;
    }
    const v = product.variants.find((vv) => vv.sizeName === selectedSize);
    setSelectedVariantId(v?.id ?? null);
  }, [selectedSize, product.variants]);

  const disabled = !selectedVariantId || loading;

  return (
    <div className="space-y-4">
      <SizePicker sizes={sizes} onChange={setSelectedSize} />
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!selectedVariantId) return;
          void add(selectedVariantId, 1);
        }}
        className={`w-full h-12 rounded-full text-button ${
          disabled
            ? "bg-dark-900/50 text-light-100 cursor-not-allowed"
            : "bg-dark-900 text-light-100 hover:bg-dark-800"
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark-900`}
        aria-disabled={disabled}
      >
        Add to Bag
      </button>
    </div>
  );
}
