import type { PriceCurrencyMode } from "@/types/salida";

export function formatMoney(
  amount: number | undefined,
  currency: "ARS" | "USD"
): string | undefined {
  if (amount == null || amount <= 0) return undefined;

  if (currency === "USD") {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface PriceDisplay {
  label: string;
  main?: string;
  original?: string;
  promo?: boolean;
  currency: "ARS" | "USD";
}

export function getPriceDisplays(
  salida: {
    precioListaArs?: number;
    promoEfectivoArs?: number;
    precioListaUsd?: number;
    promoEfectivoUsd?: number;
    enPromocion: boolean;
  },
  mode: PriceCurrencyMode
): PriceDisplay[] {
  const displays: PriceDisplay[] = [];

  const addArs = () => {
    const lista = formatMoney(salida.precioListaArs, "ARS");
    const promo = salida.enPromocion
      ? formatMoney(salida.promoEfectivoArs, "ARS")
      : undefined;
    if (!lista && !promo) return;
    displays.push({
      label: "Pesos argentinos (ARS)",
      main: promo ?? lista,
      original: promo && lista ? lista : undefined,
      promo: Boolean(promo),
      currency: "ARS",
    });
  };

  const addUsd = () => {
    const lista = formatMoney(salida.precioListaUsd, "USD");
    const promo = salida.enPromocion
      ? formatMoney(salida.promoEfectivoUsd, "USD")
      : undefined;
    if (!lista && !promo) return;
    displays.push({
      label: "Dólares (USD)",
      main: promo ?? lista,
      original: promo && lista ? lista : undefined,
      promo: Boolean(promo),
      currency: "USD",
    });
  };

  if (mode === "ars" || mode === "both") addArs();
  if (mode === "usd" || mode === "both") addUsd();

  return displays;
}

export function estadoBadgeClass(estado?: string): string {
  const e = (estado ?? "").toLowerCase();
  if (e.includes("agotado")) return "bg-red-50 text-red-700 border-red-200";
  if (e.includes("últim") || e.includes("ultim"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (e.includes("confirmar"))
    return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCharCode(Number(code))
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ");
}

export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function matchesSearch(salida: { searchText: string; titulo: string; descripcion?: string }, query: string): boolean {
  if (!query.trim()) return true;
  const q = normalizeSearch(query);
  return normalizeSearch(salida.searchText).includes(q);
}
