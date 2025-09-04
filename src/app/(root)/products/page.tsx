import React from "react";
import { Card } from "@/components";
import Filters from "@/components/Filters";
import Sort from "@/components/Sort";
import { parseFilterParams } from "@/lib/utils/query";
import { getAllProducts } from "@/lib/actions/product";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = parseFilterParams(searchParams);
  const { products, totalCount } = await getAllProducts(filters);
  const hasFilters = Object.keys(filters).length > 0;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-heading-3 text-dark-900">
          Products {totalCount ? `(${totalCount})` : ""}
        </h1>
        <Sort />
      </div>

      {hasFilters ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(filters as Record<string, unknown>).flatMap(
            ([k, v]) => {
              const arr = Array.isArray(v)
                ? v
                : v != null
                ? ([v] as unknown[])
                : [];
              return arr.map((val, idx) => (
                <span
                  key={`${k}-${idx}`}
                  className="px-2 py-1 rounded-full bg-light-200 text-dark-900 text-footnote"
                >
                  {k}: {String(val)}
                </span>
              ));
            }
          )}
        </div>
      ) : null}

      <div className="flex gap-8">
        <Filters />

        <section className="flex-1">
          {products.length === 0 ? (
            <div className="py-16 text-center text-dark-700">
              No products match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <Card
                  key={p.id}
                  title={p.title}
                  subtitle={p.subtitle}
                  colorsCount={p.colorsCount}
                  imageSrc={p.imageSrc || "/placeholder.svg"}
                  price={
                    typeof p.price === "number"
                      ? p.price
                      : p.price != null
                      ? Number(p.price)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
