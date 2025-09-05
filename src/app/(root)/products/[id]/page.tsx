import React, { Suspense } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import {
  ProductGallery,
  SizePicker,
  CollapsibleSection,
  Card,
} from "@/components";
import {
  getProduct,
  getProductReviews,
  getRecommendedProducts,
  type RecommendedProductDTO,
} from "@/lib/actions/product";

type PageProps = { params: { id: string } };

function formatPrice(n: number | null | undefined): string | null {
  if (typeof n !== "number") return null;
  return `$${n.toFixed(2)}`;
}

function NotFoundBlock() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="py-24 text-center">
        <h1 className="text-heading-2 text-dark-900 mb-2">Product not found</h1>
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

async function ReviewsSection({ productId }: { productId: string }) {
  const reviews = await getProductReviews(productId);
  if (!reviews.length) return null;
  const first10 = reviews.slice(0, 10);
  return (
    <CollapsibleSection title={`Reviews (${first10.length})`} defaultOpen>
      <div className="space-y-4">
        {first10.map((r) => (
          <article
            key={r.id}
            className="rounded-lg border border-light-300 p-4"
          >
            <div className="mb-1 flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < r.rating
                      ? "fill-dark-900 text-dark-900"
                      : "text-light-400"
                  }
                />
              ))}
              <span className="text-dark-700">{r.author}</span>
              <time
                className="ml-auto text-dark-600 text-sm"
                dateTime={r.createdAt}
              >
                {new Date(r.createdAt).toLocaleDateString()}
              </time>
            </div>
            {r.title ? (
              <h4 className="text-dark-900 font-medium">{r.title}</h4>
            ) : null}
            <p className="text-dark-700 line-clamp-5">{r.content}</p>
          </article>
        ))}
      </div>
    </CollapsibleSection>
  );
}

async function AlsoLikeSection({ productId }: { productId: string }) {
  const items: RecommendedProductDTO[] = await getRecommendedProducts(
    productId,
    6
  );
  if (!items.length) return null;
  return (
    <section className="mt-16">
      <h2 className="text-heading-3 text-dark-900 mb-6">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((r) => (
          <Card
            key={r.id}
            title={r.title}
            imageSrc={r.imageSrc}
            price={typeof r.price === "number" ? r.price : undefined}
            href={`/products/${r.id}`}
          />
        ))}
      </div>
    </section>
  );
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="mt-16">
      <h2 className="text-heading-3 text-dark-900 mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-xl bg-light-300" />
        ))}
      </div>
    </section>
  );
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const product = await getProduct(params.id);
  if (!product) return <NotFoundBlock />;

  const sizes = Array.from(
    new Set(product.variants.map((v) => v.sizeName).filter(Boolean))
  ) as string[];
  const imagesValid = Object.values(product.imagesByVariant ?? {}).some(
    (arr) => Array.isArray(arr) && arr.length > 0
  );
  const swatches = Array.from(
    new Map(
      product.variants
        .map((v) => ({
          id: v.colorId,
          label: v.colorName ?? "Color",
          hex: v.colorHex ?? undefined,
          bgClass: v.colorHex ? undefined : "bg-light-300",
        }))
        .filter((v) => v.id)
        .map((v) => [v.id, v])
    ).values()
  );

  const price = formatPrice(product.price);
  const compareAt = formatPrice(product.compareAtPrice ?? null);
  const discountPercent =
    product.price && product.compareAtPrice
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100
        )
      : null;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Gallery */}
        <section>
          {imagesValid ? (
            <ProductGallery
              imagesByVariant={product.imagesByVariant}
              swatches={swatches}
              alt={product.name}
            />
          ) : null}
        </section>

        <section className="flex flex-col">
          <div className="mb-4">
            <p className="text-footnote text-dark-700">
              {product.genderName ? `${product.genderName} Shoes` : undefined}
            </p>
            <h1 className="text-heading-2 text-dark-900 mt-1">
              {product.name}
            </h1>
          </div>

          <div className="mb-4 flex items-center gap-3">
            {price ? (
              <div className="text-heading-3 text-dark-900">{price}</div>
            ) : null}
            {compareAt ? (
              <div className="text-dark-600 line-through">{compareAt}</div>
            ) : null}
            {discountPercent ? (
              <span className="rounded-full bg-[color:oklch(0_0_0_/_0.06)] text-[--color-green] px-2 py-1 text-footnote">
                Extra {discountPercent}% off
              </span>
            ) : null}
          </div>

          {sizes.length ? (
            <div className="mt-2 mb-4">
              <h2 className="text-heading-5 text-dark-900 mb-2">Select Size</h2>
              <SizePicker sizes={sizes} />
            </div>
          ) : null}

          <div className="mt-8 divide-y divide-light-300 border-t border-light-300">
            <CollapsibleSection title="Product Details" defaultOpen>
              <p className="text-dark-700">
                High-quality materials and responsive cushioning for all-day
                comfort.
              </p>
            </CollapsibleSection>
            <CollapsibleSection title="Shipping & Returns">
              <p className="text-dark-700">
                Free standard shipping and 30-day returns.
              </p>
            </CollapsibleSection>
            <Suspense
              fallback={
                <div className="py-4 text-dark-700">Loading reviews…</div>
              }
            >
              <ReviewsSection productId={product.id} />
            </Suspense>
          </div>
        </section>
      </div>

      <Suspense fallback={<SectionSkeleton title="You Might Also Like" />}>
        <AlsoLikeSection productId={product.id} />
      </Suspense>
    </main>
  );
}
