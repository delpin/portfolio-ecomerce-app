import React from "react";
import { Card } from "@/components";
import Filters from "@/components/Filters";
import Sort from "@/components/Sort";
import { parseQuery, stringifySearchParams } from "@/lib/utils/query";
import { products } from "@/lib/mock/products";

type SearchParams = Record<string, string | string[] | undefined>;

import type { QueryObject } from "@/lib/utils/query";

function filterProducts(list: typeof products, query: QueryObject) {
  let res = [...list];

  if (query.gender) {
    const g = Array.isArray(query.gender) ? query.gender : [query.gender];
    res = res.filter((p) => (p.gender ? g.includes(p.gender) : false));
  }

  if (query.size) {
    const sizes = Array.isArray(query.size) ? query.size : [query.size];
    res = res.filter((p) => p.sizes?.some((s: string) => sizes.includes(String(s).toLowerCase())));
  }

  if (query.color) {
    const colors = Array.isArray(query.color) ? query.color : [query.color];
    res = res.filter((p) => p.colors?.some((c: string) => colors.includes(String(c).toLowerCase())));
  }

  if (query.price) {
    const ranges = (Array.isArray(query.price) ? query.price : [query.price])
      .filter((v): v is string | number => v !== undefined && v !== null)
      .map((v) => String(v));
    res = res.filter((p) =>
      ranges.some((r) => {
        const [minS, maxS] = r.split("-");
        const min = Number(minS);
        const max = Number(maxS);
        return p.price >= min && p.price <= max;
      }),
    );
  }

  const sort = query.sort as string | undefined;
  if (sort === "price_asc") res.sort((a, b) => a.price - b.price);
  else if (sort === "price_desc") res.sort((a, b) => b.price - a.price);
  else if (sort === "newest") res.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  return res;
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const q = parseQuery(stringifySearchParams(searchParams));

  const filtered = filterProducts(products, q);
  const hasFilters = Object.keys(q).length > 0;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-heading-3 text-dark-900">Products {filtered.length ? `(${filtered.length})` : ""}</h1>
        <Sort />
      </div>

      {hasFilters ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(q).flatMap(([k, v]) => {
            const arr = Array.isArray(v) ? v : [v];
            return arr.map((val, idx) => (
              <span
                key={`${k}-${idx}`}
                className="px-2 py-1 rounded-full bg-light-200 text-dark-900 text-footnote"
              >
                {k}: {String(val)}
              </span>
            ));
          })}
        </div>
      ) : null}

      <div className="flex gap-8">
        <Filters />

        <section className="flex-1">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-dark-700">No products match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <Card
                  key={p.id}
                  title={p.title}
                  subtitle={`${p.gender ? `${p.gender[0].toUpperCase()}${p.gender.slice(1)}` : ""} Shoes`}
                  colorsCount={p.colors?.length}
                  imageSrc={p.imageSrc}
                  price={p.price}
                  badge={p.badge}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
