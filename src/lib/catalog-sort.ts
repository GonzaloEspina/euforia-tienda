import type { PriceCurrencyMode, Salida } from "@/types/salida";

export type CatalogSort =
  | "nombre-asc"
  | "nombre-desc"
  | "precio-asc"
  | "precio-desc"
  | "fecha-asc"
  | "fecha-desc";

export const CATALOG_SORT_OPTIONS: {
  value: CatalogSort;
  label: string;
}[] = [
  { value: "fecha-asc", label: "Fecha: más próxima" },
  { value: "fecha-desc", label: "Fecha: más lejana" },
  { value: "nombre-asc", label: "Nombre: A → Z" },
  { value: "nombre-desc", label: "Nombre: Z → A" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
];

export const DEFAULT_CATALOG_SORT: CatalogSort = "fecha-asc";

function parseSalidaFecha(fecha?: string): number | null {
  if (!fecha) return null;
  const parts = fecha.split("/").map((p) => Number(p.trim()));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const [day, month, year] = parts;
  const time = new Date(year, month - 1, day).getTime();
  return Number.isNaN(time) ? null : time;
}

function getSortPrice(
  salida: Salida,
  priceMode: PriceCurrencyMode
): number | null {
  if (priceMode === "usd") {
    const usd = salida.promoEfectivoUsd ?? salida.precioListaUsd;
    return usd && usd > 0 ? usd : null;
  }

  const ars = salida.promoEfectivoArs ?? salida.precioListaArs;
  if (ars && ars > 0) return ars;

  if (priceMode === "both") {
    const usd = salida.promoEfectivoUsd ?? salida.precioListaUsd;
    return usd && usd > 0 ? usd : null;
  }

  return null;
}

function compareNullable(
  a: number | null,
  b: number | null,
  direction: "asc" | "desc"
): number {
  const missing = direction === "asc" ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
  const av = a ?? missing;
  const bv = b ?? missing;
  return direction === "asc" ? av - bv : bv - av;
}

export function sortSalidas(
  salidas: Salida[],
  sort: CatalogSort,
  priceMode: PriceCurrencyMode
): Salida[] {
  const sorted = [...salidas];

  sorted.sort((a, b) => {
    switch (sort) {
      case "nombre-asc":
        return a.titulo.localeCompare(b.titulo, "es");
      case "nombre-desc":
        return b.titulo.localeCompare(a.titulo, "es");
      case "precio-asc":
        return compareNullable(
          getSortPrice(a, priceMode),
          getSortPrice(b, priceMode),
          "asc"
        );
      case "precio-desc":
        return compareNullable(
          getSortPrice(a, priceMode),
          getSortPrice(b, priceMode),
          "desc"
        );
      case "fecha-asc":
        return compareNullable(
          parseSalidaFecha(a.fecha),
          parseSalidaFecha(b.fecha),
          "asc"
        );
      case "fecha-desc":
        return compareNullable(
          parseSalidaFecha(a.fecha),
          parseSalidaFecha(b.fecha),
          "desc"
        );
      default:
        return 0;
    }
  });

  return sorted;
}
