import type { WooCategory } from "@/types/salida";
import { getStoreHref } from "@/lib/config";

/** Categoría principal para el ítem de menú «Salidas Grupales». */
export const SALIDAS_GRUPALES_CATEGORY_SLUG = "salidas-grupales";

export const DESTINATION_FILTERS = [
  { id: "termas", label: "Termas", icon: "♨️", query: "termas" },
  { id: "brasil", label: "Brasil", icon: "🇧🇷", query: "brasil" },
  { id: "cancun", label: "Cancún", icon: "🏝️", query: "cancun" },
  { id: "bariloche", label: "Bariloche", icon: "🏔️", query: "bariloche" },
  { id: "europa", label: "Europa", icon: "🌍", query: "europa" },
  { id: "mendoza", label: "Mendoza", icon: "🍷", query: "mendoza" },
  { id: "ushuaia", label: "Ushuaia", icon: "🧊", query: "ushuaia" },
  { id: "salta", label: "Salta", icon: "⛰️", query: "salta" },
] as const;

export type CatalogUrlFilters = {
  search: string;
  categorySlug: string | null;
  onlyDestacado: boolean;
  onlyPromo: boolean;
};

export function resolveCategorySlug(
  categories: WooCategory[],
  preferred: string
): string | null {
  if (categories.some((c) => c.slug === preferred)) return preferred;
  const fallbacks = ["salidas-grupales", "nacionales", "internacionales"];
  return fallbacks.find((slug) => categories.some((c) => c.slug === slug)) ?? null;
}

export function readCatalogUrlFilters(
  params: URLSearchParams,
  _categories: WooCategory[]
): CatalogUrlFilters {
  const catParam = params.get("cat");

  return {
    search: params.get("q") ?? "",
    categorySlug: catParam,
    onlyDestacado: params.get("destacado") === "1",
    onlyPromo: params.get("promo") === "1",
  };
}

export function buildCatalogUrlFilters(filters: CatalogUrlFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("q", filters.search.trim());
  if (filters.categorySlug) params.set("cat", filters.categorySlug);
  if (filters.onlyDestacado) params.set("destacado", "1");
  if (filters.onlyPromo) params.set("promo", "1");
  return params;
}

export function salidasGrupalesHref(): string {
  const params = buildCatalogUrlFilters({
    search: "",
    categorySlug: SALIDAS_GRUPALES_CATEGORY_SLUG,
    onlyDestacado: false,
    onlyPromo: false,
  });
  return getStoreHref(params, "#salidas");
}

export function destinationHref(query: string): string {
  const params = buildCatalogUrlFilters({
    search: query,
    categorySlug: null,
    onlyDestacado: false,
    onlyPromo: false,
  });
  return getStoreHref(params, "#salidas");
}

