import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart, Star } from "lucide-react";
import { products } from "@/lib/mock/products";
import ProductGallery from "@/components/ProductGallery";
import SizePicker from "@/components/SizePicker";
import CollapsibleSection from "@/components/CollapsibleSection";
import Card from "@/components/Card";

type PageProps = { params: { id: string } };

export default async function ProductDetailsPage({ params }: PageProps) {
  const id = Number(params.id);
  const product = products.find((p) => p.id === id);

  // Простая заглушка, если продукт не найден
  if (!product) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="py-24 text-center">
          <h1 className="text-heading-2 text-dark-900 mb-2">
            Product not found
          </h1>
          <p className="text-dark-700 mb-6">
            The product you are looking for does not exist.
          </p>
          <Link
            href="/products"
            className="inline-block rounded-full bg-dark-900 text-light-100 px-5 py-3 text-button"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  const discountPrice = product.price;
  const compareAtPrice = Math.round(product.price * 1.2 * 100) / 100; // фиктивная скидка 20%
  const discountPercent = Math.round(
    ((compareAtPrice - discountPrice) / compareAtPrice) * 100
  );

  // Фиктивные изображения/варианты на основе public/shoes
  const variantImages: Record<string, string[]> = {
    default: [
      product.imageSrc,
      "/shoes/shoe-6.avif",
      "/shoes/shoe-5.avif",
      "/shoes/shoe-12.avif",
      "/shoes/shoe-13.avif",
    ],
    pink: ["/shoes/shoe-10.avif", "/shoes/shoe-14.avif", "/shoes/shoe-15.avif"],
    gray: ["/shoes/shoe-9.avif", "/shoes/shoe-8.avif"],
    white: ["/shoes/shoe-1.jpg", "/shoes/shoe-2.webp"],
  };

  const swatches = [
    { id: "default", label: "Default", bgClass: "bg-[#8a3145]" },
    { id: "pink", label: "Pink", bgClass: "bg-[#e48ba1]" },
    { id: "gray", label: "Gray", bgClass: "bg-[#8f8f8f]" },
    { id: "white", label: "White", bgClass: "bg-[#eaeaea]" },
  ];

  const related = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        <section>
          <ProductGallery
            imagesByVariant={variantImages}
            swatches={swatches}
            alt={product.title}
          />
        </section>

        <section className="flex flex-col">
          <div className="mb-4">
            <p className="text-footnote text-dark-700">
              {product.gender === "women"
                ? "Women's Shoes"
                : product.gender === "men"
                ? "Men's Shoes"
                : "Unisex"}
            </p>
            <h1 className="text-heading-2 text-dark-900 mt-1">
              {product.title}
            </h1>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="text-heading-3 text-dark-900">
              ${discountPrice.toFixed(2)}
            </div>
            <div className="text-dark-600 line-through">
              ${compareAtPrice.toFixed(2)}
            </div>
            <span className="rounded-full bg-[color:oklch(0_0_0_/_0.06)] text-[--color-green] px-2 py-1 text-footnote">
              Extra {discountPercent}% off
            </span>
          </div>

          <div className="mt-2 mb-4">
            <h2 className="text-heading-5 text-dark-900 mb-2">Select Size</h2>
            <div className="flex items-center gap-2 mb-2">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-dark-300 px-3 py-2 text-button text-dark-900"
                aria-label="Size guide"
              >
                <Image
                  src="/window.svg"
                  alt="size guide"
                  width={16}
                  height={16}
                />{" "}
                Size Guide
              </button>
            </div>
            <SizePicker
              sizes={[
                "5",
                "5.5",
                "6",
                "6.5",
                "7",
                "7.5",
                "8",
                "8.5",
                "9",
                "9.5",
                "10",
              ]}
            />
          </div>

          <div className="mt-2 flex flex-col gap-3">
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-dark-900 text-light-100 px-6 py-4 text-button">
              <ShoppingBag size={18} aria-hidden /> Add to Bag
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-light-200 text-dark-900 px-6 py-4 text-button">
              <Heart size={18} aria-hidden /> Favorite
            </button>
          </div>

          <div className="mt-8 divide-y divide-light-300 border-t border-light-300">
            <CollapsibleSection title="Product Details" defaultOpen>
              <p className="text-dark-700">
                The Air Max 90 stays true to its running roots with the iconic
                Waffle sole, stitched overlays and textured accents.
              </p>
            </CollapsibleSection>
            <CollapsibleSection title="Shipping & Returns">
              <p className="text-dark-700">
                Free standard shipping and 30-day returns.
              </p>
            </CollapsibleSection>
            <CollapsibleSection title="Reviews (0)">
              <div className="flex items-center gap-2 text-dark-700">
                <Star size={16} /> No reviews yet.
              </div>
            </CollapsibleSection>
          </div>
        </section>
      </div>

      <section className="mt-16">
        <h2 className="text-heading-3 text-dark-900 mb-6">
          You Might Also Like
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.map((r) => (
            <Card
              key={r.id}
              title={r.title}
              subtitle={
                r.gender === "women"
                  ? "Women's Shoes"
                  : r.gender === "men"
                  ? "Men's Shoes"
                  : "Unisex"
              }
              price={r.price}
              imageSrc={r.imageSrc}
              href={`/products/${r.id}`}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
