export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/tienda";

const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_WOO_URL?.replace(/\/$/, "") ??
  "https://viajaconeuforia.com";

/** URL pública de la home de marketing (raíz del dominio). */
export const PUBLIC_HOME_PATH = "/";

/** URL pública del catálogo / tienda. */
export const PUBLIC_STORE_PATH = "/tienda";

/** Ruta interna Next (con basePath) de la home de marketing. */
export const INTERNAL_HOME_ROUTE = "/inicio";

export function getPublicHomeUrl(): string {
  return `${SITE_ORIGIN}${PUBLIC_HOME_PATH}`;
}

export function getPublicStoreUrl(
  query?: URLSearchParams | string,
  hash?: string
): string {
  const qs =
    typeof query === "string"
      ? query
      : query && query.toString()
        ? query.toString()
        : "";
  const suffix = `${qs ? `?${qs}` : ""}${hash ?? ""}`;
  return `${SITE_ORIGIN}${PUBLIC_STORE_PATH}${suffix}`;
}

/** Enlace interno Next hacia el catálogo (resuelve a /tienda en el navegador). */
export function getStoreHref(query?: URLSearchParams | string, hash?: string): string {
  const qs =
    typeof query === "string"
      ? query
      : query && query.toString()
        ? query.toString()
        : "";
  const suffix = `${qs ? `?${qs}` : ""}${hash ?? ""}`;
  return `/${suffix}`;
}

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
