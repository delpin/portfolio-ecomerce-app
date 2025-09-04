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
