"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  parseQuery,
  stringifyQuery,
  toggleInMulti,
  QueryObject,
} from "@/lib/utils/query";

type Option = { label: string; value: string };
type Group = { key: string; title: string; options: Option[] };

const GROUPS: Group[] = [
  {
    key: "gender",
    title: "Gender",
    options: [
      { label: "Men", value: "men" },
      { label: "Women", value: "women" },
      { label: "Unisex", value: "unisex" },
    ],
  },
  {
    key: "size",
    title: "Size",
    options: ["7", "8", "9", "10", "11"].map((s) => ({
      label: String(s),
      value: String(s).toLowerCase(),
    })),
  },
  {
    key: "color",
    title: "Color",
    options: ["black", "white", "red", "green", "blue", "grey"].map((c) => ({
      label: c[0].toUpperCase() + c.slice(1),
      value: c,
    })),
  },
  {
    key: "price",
    title: "Price Range",
    options: [
      { label: "$0 - $50", value: "0-50" },
      { label: "$50 - $100", value: "50-100" },
      { label: "$100 - $150", value: "100-150" },
      { label: "$150+", value: "150-9999" },
    ],
  },
];

function useQueryState(): [
  QueryObject,
  (updater: (q: QueryObject) => QueryObject) => void
] {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const query = useMemo(() => parseQuery(sp.toString()), [sp]);

  const setQuery = (updater: (q: QueryObject) => QueryObject) => {
    const next = updater(query);
    const qs = stringifyQuery(next);
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  };

  return [query, setQuery];
}

export default function Filters() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useQueryState();

  useEffect(() => {
    const map: Record<string, boolean> = {};
    GROUPS.forEach((g) => (map[g.key] = true));
    setExpanded(map);
  }, []);

  const isChecked = (key: string, value: string) => {
    // Exclusive logic for price: we store `price` as "min-max" string or derived from priceMin/priceMax
    if (key === "price") {
      const raw = (query.price as string | undefined) ?? undefined;
      const fromMinMax =
        typeof query.priceMin === "number" || typeof query.priceMax === "number"
          ? `${query.priceMin ?? 0}-${query.priceMax ?? 9999}`
          : undefined;
      const current = raw ?? fromMinMax;
      return current === value;
    }
    const v = query[key];
    if (Array.isArray(v)) return v.map(String).includes(String(value));
    return v != null && String(v) === String(value);
  };

  const onToggle = (key: string, value: string) => {
    if (key === "price") {
      // Price is exclusive: clicking the same value unsets, clicking another value sets that one
      setQuery((q) => {
        const checked = isChecked("price", value);
        if (checked) {
          const next = { ...q };
          delete next.price;
          delete next.priceMin;
          delete next.priceMax;
          return next;
        }
        const [minStr, maxStr] = value.split("-");
        const priceMin = Number(minStr);
        const priceMax = Number(maxStr);
        return {
          ...q,
          price: value,
          priceMin: Number.isNaN(priceMin) ? undefined : priceMin,
          priceMax: Number.isNaN(priceMax) ? undefined : priceMax,
          page: 1,
        };
      });
      return;
    }
    setQuery((q) => toggleInMulti(q, key, value));
  };

  const clearAll = () => {
    setQuery(() => ({}));
  };

  return (
    <>
      <div className="md:hidden mb-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-3 py-2 border border-light-300 rounded-md text-dark-900"
          aria-controls="filter-drawer"
          aria-expanded={open}
        >
          Filters
        </button>
      </div>

      <aside className="hidden md:block w-64 shrink-0" aria-label="Filters">
        <Panel
          groups={GROUPS}
          expanded={expanded}
          setExpanded={setExpanded}
          isChecked={isChecked}
          onToggle={onToggle}
          onClear={clearAll}
        />
      </aside>

      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div
            id="filter-drawer"
            className="absolute inset-y-0 left-0 w-80 bg-light-100 p-4 overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-heading-3">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-2 py-1 border border-light-300 rounded-md"
              >
                Close
              </button>
            </div>
            <Panel
              groups={GROUPS}
              expanded={expanded}
              setExpanded={setExpanded}
              isChecked={isChecked}
              onToggle={onToggle}
              onClear={clearAll}
            />
          </div>
        </div>
      )}
    </>
  );
}

function Panel({
  groups,
  expanded,
  setExpanded,
  isChecked,
  onToggle,
  onClear,
}: {
  groups: Group[];
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isChecked: (key: string, value: string) => boolean;
  onToggle: (key: string, value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-dark-900">Filters</span>
        <button
          type="button"
          onClick={onClear}
          className="text-dark-700 underline"
        >
          Clear
        </button>
      </div>
      {groups.map((g) => (
        <div key={g.key} className="border-t border-light-300 pt-4">
          <button
            type="button"
            className="w-full flex items-center justify-between"
            aria-expanded={!!expanded[g.key]}
            onClick={() =>
              setExpanded((prev) => ({ ...prev, [g.key]: !prev[g.key] }))
            }
          >
            <span className="text-dark-900">{g.title}</span>
            <span className="text-dark-700">{expanded[g.key] ? "−" : "+"}</span>
          </button>
          {expanded[g.key] && (
            <ul className="mt-3 space-y-2">
              {g.options.map((o) => (
                <li key={o.value} className="flex items-center gap-2">
                  <input
                    id={`${g.key}-${o.value}`}
                    type="checkbox"
                    className="h-4 w-4 accent-dark-900"
                    checked={isChecked(g.key, o.value)}
                    onChange={() => onToggle(g.key, o.value)}
                  />
                  <label
                    htmlFor={`${g.key}-${o.value}`}
                    className="text-dark-900"
                  >
                    {o.label}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
