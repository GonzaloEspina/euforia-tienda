import { getWooSiteUrl } from "@/lib/checkout-url";

let primePromise: Promise<void> | null = null;

export function hasWooSessionCookie(): boolean {
  return /(?:^|;\s*)wp_woocommerce_session_/.test(document.cookie);
}

export function hasCartCookie(): boolean {
  return /(?:^|;\s*)woocommerce_items_in_cart=1(?:;|$)/.test(
    document.cookie
  );
}

async function fetchWooFragments(): Promise<{ cart_hash?: string } | null> {
  try {
    const res = await fetch(
      `${getWooSiteUrl()}/?wc-ajax=get_refreshed_fragments`,
      { method: "POST", credentials: "include" }
    );
    if (!res.ok) return null;
    return (await res.json()) as { cart_hash?: string };
  } catch {
    return null;
  }
}

/** Crea la sesión de Woo en el navegador antes del primer checkout. */
export function primeWooSession(): Promise<void> {
  if (primePromise) return primePromise;

  primePromise = (async () => {
    await fetchWooFragments();
    if (!hasWooSessionCookie()) {
      await fetch(getWooSiteUrl(), { credentials: "include" }).catch(() => {});
    }
  })();

  return primePromise;
}

/** Espera a que el carrito clásico quede persistido tras add_to_cart. */
export async function waitForCartReady(maxAttempts = 12): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    if (hasCartCookie()) return true;

    const data = await fetchWooFragments();
    if (data?.cart_hash) return true;

    await new Promise((r) => setTimeout(r, 50));
  }

  return hasCartCookie();
}
