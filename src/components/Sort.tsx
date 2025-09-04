"use client";

import React, { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseQuery, stringifyQuery, upsertParams } from "@/lib/utils/query";

const OPTIONS = [
  { label: "Newest", value: "latest" },
  { label: "Price (High → Low)", value: "price_desc" },
  { label: "Price (Low → High)", value: "price_asc" },
];

export default function Sort() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const current = useMemo(() => parseQuery(sp.toString()), [sp]);
  const selected = (current.sortBy as string) ?? "latest";

  const onChange = (val: string) => {
    const next = upsertParams(current, { sortBy: val, page: 1 });
    const qs = stringifyQuery(next);
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="relative inline-flex">
      <label htmlFor="sort" className="sr-only">
        Sort
      </label>
      <select
        id="sort"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="border border-light-300 rounded-md px-3 py-2 text-dark-900 bg-light-100"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
