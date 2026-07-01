export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/tienda";

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
