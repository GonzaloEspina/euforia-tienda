import { WOO_CHECKOUT_PATH } from "@/lib/config";

export function getWooSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_WOO_URL ?? "https://viajaconeuforia.com"
  ).replace(/\/$/, "");
}

export function getCheckoutUrl(couponCode?: string): string {
  const base = `${getWooSiteUrl()}${WOO_CHECKOUT_PATH.replace(/\/$/, "")}/`;
  const code = couponCode?.trim();
  if (!code) return base;
  return `${base}?apply_coupon=${encodeURIComponent(code)}`;
}
