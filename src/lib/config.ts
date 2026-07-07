export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/tienda";

const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_WOO_URL?.replace(/\/$/, "") ??
  "https://viajaconeuforia.com";

/** Página de cuenta en WordPress (login/registro). */
export const ACCOUNT_PAGE_URL = `${SITE_ORIGIN}/mi-cuenta/`;

export function getTiendaAccountUrl(): string {
  return `${SITE_ORIGIN}${BASE_PATH}/mi-cuenta`;
}

/** Login en WordPress con retorno a la tienda. */
export function getWpAccountLoginUrl(): string {
  const returnTo = getTiendaAccountUrl();
  return `${ACCOUNT_PAGE_URL}?redirect_to=${encodeURIComponent(returnTo)}`;
}

/** Slug de la página de checkout en WooCommerce (español: finalizar-compra). */
export const WOO_CHECKOUT_PATH =
  process.env.NEXT_PUBLIC_WOO_CHECKOUT_PATH ?? "/finalizar-compra";

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${p}`;
}

export function staticUrl(path: string): string {
  return apiUrl(path);
}
