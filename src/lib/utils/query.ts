import qs from "query-string";

export type QueryValue = string | number | boolean | null | undefined | Array<string | number | boolean>;
export type QueryObject = Record<string, QueryValue>;

export function parseQuery(queryString: string): QueryObject {
  return qs.parse(queryString, { arrayFormat: "comma", parseBooleans: true, parseNumbers: true }) as QueryObject;
}

export function stringifyQuery(params: QueryObject): string {
  return qs.stringify(params, { arrayFormat: "comma", skipNull: true, skipEmptyString: true, sort: false });
}

export function stringifySearchParams(sp: Record<string, string | string[] | undefined>): string {
  return qs.stringify(sp, { arrayFormat: "comma", skipNull: true, skipEmptyString: true, sort: false });
}

export function upsertParams(current: QueryObject, patch: QueryObject): QueryObject {
  const next: QueryObject = { ...current };
  for (const key of Object.keys(patch)) {
    const val = patch[key];
    if (
      val === undefined ||
      val === null ||
      (Array.isArray(val) && val.length === 0) ||
      (typeof val === "string" && val.trim() === "")
    ) {
      delete next[key];
    } else {
      next[key] = val;
    }
  }
  return next;
}

export function toggleInMulti(current: QueryObject, key: string, value: string | number): QueryObject {
  const raw = current[key];
  const arr = Array.isArray(raw) ? [...raw] : raw != null ? [raw] : [];
  const idx = arr.findIndex((v) => String(v) === String(value));
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push(value);
  return upsertParams(current, { [key]: arr });
}

export function removeKeys(current: QueryObject, keys: string[]): QueryObject {
  const next = { ...current };
  for (const k of keys) delete next[k];
  return next;
}

export type ParsedFilters = {
  search?: string;
  brandIds?: string[];
  categoryIds?: string[];
  genderIds?: string[];
  colorIds?: string[];
  sizeIds?: string[];
  priceMin?: number;
  priceMax?: number;
  sortBy?: "latest" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
};

export function parseFilterParams(sp: Record<string, string | string[] | undefined>): ParsedFilters {
  const normalized = qs.parse(qs.stringify(sp, { arrayFormat: "comma", skipNull: true, skipEmptyString: true, sort: false }), {
    arrayFormat: "comma",
    parseBooleans: true,
    parseNumbers: true,
  }) as Record<string, unknown>;

  const toArray = (v: unknown): string[] | undefined => {
    if (v === undefined || v === null || v === "") return undefined;
    return Array.isArray(v) ? (v as unknown[]).map((x) => String(x)) : [String(v)];
  };

  const priceMin = typeof normalized.priceMin === "number" ? (normalized.priceMin as number) : undefined;
  const priceMax = typeof normalized.priceMax === "number" ? (normalized.priceMax as number) : undefined;

  const page = typeof normalized.page === "number" ? Math.max(1, normalized.page as number) : 1;
  const limit = typeof normalized.limit === "number" ? Math.min(60, Math.max(1, normalized.limit as number)) : 24;

  const sort = typeof normalized.sortBy === "string" ? (normalized.sortBy as ParsedFilters["sortBy"]) : "latest";

  return {
    search: typeof normalized.search === "string" ? (normalized.search as string).trim() : undefined,
    brandIds: toArray(normalized.brand),
    categoryIds: toArray(normalized.category),
    genderIds: toArray(normalized.gender),
    colorIds: toArray(normalized.color),
    sizeIds: toArray(normalized.size),
    priceMin,
    priceMax,
    sortBy: sort,
    page,
    limit,
  };
}

export function buildProductQueryObject(filters: ParsedFilters): ParsedFilters {
  return {
    search: filters.search,
    brandIds: filters.brandIds,
    categoryIds: filters.categoryIds,
    genderIds: filters.genderIds,
    colorIds: filters.colorIds,
    sizeIds: filters.sizeIds,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    sortBy: filters.sortBy ?? "latest",
    page: filters.page ?? 1,
    limit: filters.limit ?? 24,
  };
}
