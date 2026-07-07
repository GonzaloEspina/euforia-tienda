import { getWooSiteUrl } from "@/lib/checkout-url";

export type WpSession = {
  logged_in: boolean;
  name?: string;
  email?: string;
  dni?: string | null;
};

export function getWpPuntosApiBase(): string {
  return `${getWooSiteUrl()}/wp-json/euforia-puntos/v1`;
}

/** Lee la sesión de WooCommerce/WordPress usando las cookies del navegador. */
export async function fetchWpSession(): Promise<WpSession> {
  try {
    const res = await fetch(`${getWpPuntosApiBase()}/me`, {
      credentials: "include",
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as WpSession;
    if (data.logged_in) return data;
    return { logged_in: false };
  } catch {
    return { logged_in: false };
  }
}
