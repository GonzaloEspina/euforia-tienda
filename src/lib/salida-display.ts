import type { PriceCurrencyMode, Salida } from "@/types/salida";
import { WOO_CHECKOUT_PATH } from "@/lib/config";
import { getWooBaseUrl } from "@/lib/woocommerce";

export function getDirectPurchaseUrl(
  salidaId: number,
  couponCode?: string
): string {
  const checkout = WOO_CHECKOUT_PATH.replace(/\/$/, "");
  const base = `${getWooBaseUrl()}${checkout}/?add-to-cart=${salidaId}`;
  const code = couponCode?.trim();
  if (!code) return base;
  return `${base}&apply_coupon=${encodeURIComponent(code)}`;
}

export function hasArsPrice(salida: Salida): boolean {
  return Boolean(salida.promoEfectivoArs ?? salida.precioListaArs);
}

export function hasUsdPrice(salida: Salida): boolean {
  return Boolean(salida.promoEfectivoUsd ?? salida.precioListaUsd);
}

/** Salida sin precio en pesos (solo dólares u otro caso sin ARS). */
export function isUsdOnlySalida(salida: Salida): boolean {
  return hasUsdPrice(salida) && !hasArsPrice(salida);
}

export function hasPriceInMode(
  salida: Salida,
  priceMode: PriceCurrencyMode
): boolean {
  if (priceMode === "ars") return hasArsPrice(salida);
  if (priceMode === "usd") return hasUsdPrice(salida);
  return hasArsPrice(salida) || hasUsdPrice(salida);
}

export function getCardPrimaryAction(
  salida: Salida,
  priceMode: PriceCurrencyMode
): { label: string; href: string; variant: "detalle" | "cotizar" } {
  if (hasPriceInMode(salida, priceMode)) {
    return {
      label: "Ver detalle",
      href: `/salida/${salida.slug}`,
      variant: "detalle",
    };
  }

  if (priceMode === "usd") {
    return {
      label: "Cotizar en dólares",
      href: `/cotizar/${salida.slug}`,
      variant: "cotizar",
    };
  }

  if (priceMode === "ars") {
    return {
      label: "Cotizar en pesos",
      href: `/cotizar/${salida.slug}`,
      variant: "cotizar",
    };
  }

  return {
    label: "Solicitar cotización",
    href: `/cotizar/${salida.slug}`,
    variant: "cotizar",
  };
}

export function getCardCotizacionHint(
  salida: Salida,
  priceMode: PriceCurrencyMode
): string | null {
  if (hasPriceInMode(salida, priceMode)) return null;

  if (priceMode === "usd") {
    return "Compra en dólares vía cotización con un asesor";
  }
  if (priceMode === "ars") {
    return "Compra en pesos vía cotización con un asesor";
  }
  return "Consultá precio con un asesor";
}

/** Compra online con Mercado Pago no aplica: solo USD o vista en dólares. */
export function shouldUseCotizacionUsd(
  salida: Salida,
  priceMode: PriceCurrencyMode
): boolean {
  if (priceMode === "usd") return true;
  return isUsdOnlySalida(salida);
}

export function canPurchaseOnline(
  salida: Salida,
  priceMode: PriceCurrencyMode
): boolean {
  if (shouldUseCotizacionUsd(salida, priceMode)) return false;
  if (!hasArsPrice(salida)) return false;
  if (!salida.isInStock) return false;
  return salida.isPurchasable;
}

/** Hay cupos pero la compra online no aplica (sin precio ARS, USD, etc.). */
export function shouldOfferCotizacion(
  salida: Salida,
  priceMode: PriceCurrencyMode
): boolean {
  if (!salida.isInStock) return false;
  if (canPurchaseOnline(salida, priceMode)) return false;
  return true;
}

export function getFinanciacionLabel(maxCuotas = 12): string {
  return `Hasta ${maxCuotas} cuotas · Consultá financiación`;
}

export interface SalidaMetaChip {
  icon: string;
  label: string;
}

export function getSalidaMetaChips(salida: Salida): SalidaMetaChip[] {
  const chips: SalidaMetaChip[] = [];

  if (salida.noches) {
    chips.push({
      icon: "🌙",
      label: `${salida.noches} noche${salida.noches === "1" ? "" : "s"}`,
    });
  }
  if (salida.origen) {
    chips.push({ icon: "📍", label: `Desde ${salida.origen}` });
  }
  if (salida.transporte[0]) {
    chips.push({ icon: "🚌", label: salida.transporte[0] });
  }
  if (salida.destino) {
    chips.push({ icon: "🗺️", label: salida.destino });
  }

  return chips;
}

export function getPrimaryPriceAmount(salida: Salida): number | undefined {
  return (
    salida.promoEfectivoArs ??
    salida.precioListaArs ??
    salida.promoEfectivoUsd ??
    salida.precioListaUsd
  );
}

export type CuposUrgencyVariant = "critical" | "low" | "normal" | "soldout";

export interface CuposUrgency {
  message: string;
  variant: CuposUrgencyVariant;
  show: boolean;
}

export function getFinanciacionBaseArs(salida: Salida): number | undefined {
  if (
    salida.enPromocion &&
    salida.promoEfectivoArs &&
    salida.precioListaArs
  ) {
    return salida.precioListaArs;
  }
  return salida.promoEfectivoArs ?? salida.precioListaArs;
}

/** La promo efectivo no aplica a financiación en cuotas. */
export function usesListaPriceForFinanciacion(salida: Salida): boolean {
  return Boolean(
    salida.enPromocion &&
      salida.promoEfectivoArs &&
      salida.precioListaArs &&
      salida.promoEfectivoArs < salida.precioListaArs
  );
}

export function getCuposUrgency(salida: Salida): CuposUrgency {
  const ultimos =
    salida.estado?.toLowerCase().includes("últim") ||
    salida.estado?.toLowerCase().includes("ultim");

  if (!salida.isInStock) {
    return {
      message: "Sin cupos disponibles",
      variant: "soldout",
      show: true,
    };
  }

  const cupos = salida.cupos;

  if (cupos && cupos > 0) {
    if (cupos <= 5 || ultimos) {
      return {
        message: `🔥 ¡Últimos cupos! Quedan ${cupos} lugar${cupos === 1 ? "" : "es"}`,
        variant: "critical",
        show: true,
      };
    }
    if (cupos <= 15) {
      return {
        message: `⚡ Quedan solo ${cupos} cupos disponibles`,
        variant: "low",
        show: true,
      };
    }
    return {
      message: `${cupos} cupos disponibles`,
      variant: "normal",
      show: true,
    };
  }

  if (ultimos) {
    return {
      message: "🔥 ¡Últimos cupos disponibles!",
      variant: "critical",
      show: true,
    };
  }

  if (salida.stockText) {
    return {
      message: salida.stockText,
      variant: "normal",
      show: true,
    };
  }

  return { message: "", variant: "normal", show: false };
}
