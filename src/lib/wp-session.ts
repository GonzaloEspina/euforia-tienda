import { getWooSiteUrl } from "@/lib/checkout-url";
import { getTiendaAccountUrl } from "@/lib/config";

export type WpSession = {
  logged_in: boolean;
  name?: string;
  email?: string;
  dni?: string | null;
  logout_url?: string;
};

export function getWpPuntosApiBase(): string {
  return `${getWooSiteUrl()}/wp-json/euforia-puntos/v1`;
}

/** Lee la sesión de WooCommerce/WordPress usando las cookies del navegador. */
export async function fetchWpSession(): Promise<WpSession> {
  const returnTo = encodeURIComponent(getTiendaAccountUrl());
  try {
    const res = await fetch(`${getWpPuntosApiBase()}/me?return_to=${returnTo}`, {
      credentials: "include",
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as WpSession & {
      code?: string;
    };
    if (data.logged_in) return data;
    return { logged_in: false };
  } catch {
    return { logged_in: false };
  }
}
