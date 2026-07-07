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
    const data = (await res.json().catch(() => ({}))) as WpSession;
    if (data.logged_in) return data;
    return { logged_in: false };
  } catch {
    return { logged_in: false };
  }
}

export async function wpLogin(username: string, password: string): Promise<WpSession> {
  const returnTo = getTiendaAccountUrl();
  const res = await fetch(`${getWpPuntosApiBase()}/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ username, password, return_to: returnTo }),
  });

  const data = (await res.json().catch(() => ({}))) as WpSession & {
    message?: string;
    code?: string;
  };

  if (!res.ok) {
    if (res.status === 404 || data.code === "rest_no_route") {
      throw new Error("rest_no_route");
    }
    throw new Error(data.message ?? "Usuario o contraseña incorrectos.");
  }

  if (!data.logged_in) {
    throw new Error("No se pudo iniciar sesión.");
  }

  return data;
}
