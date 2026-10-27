export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function pageNumber(value: string | string[] | undefined): number {
  const n = parseInt(one(value), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function hrefWith(base: string, params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") qs.set(k, String(v));
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
}

export const PAGE_SIZE = 50;
export const CLASS_YEARS = [2027, 2028];
