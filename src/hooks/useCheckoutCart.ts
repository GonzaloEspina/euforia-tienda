"use client";

import { useCallback, useEffect, useState } from "react";
import { getWooSiteUrl } from "@/lib/checkout-url";

export const CHECKOUT_CART_CHANGED = "euforia-checkout-cart-changed";

export function notifyCheckoutCartChanged(): void {
  window.dispatchEvent(new Event(CHECKOUT_CART_CHANGED));
}

function hasCartCookie(): boolean {
  return /(?:^|;\s*)woocommerce_items_in_cart=1(?:;|$)/.test(
    document.cookie
  );
}

async function checkClassicCart(): Promise<boolean> {
  if (hasCartCookie()) return true;

  try {
    const res = await fetch(
      `${getWooSiteUrl()}/?wc-ajax=get_refreshed_fragments`,
      { method: "POST", credentials: "include" }
    );
    if (!res.ok) return false;

    const data = (await res.json()) as { cart_hash?: string };
    return Boolean(data.cart_hash);
  } catch {
    return false;
  }
}

export function useCheckoutCart() {
  const [hasItems, setHasItems] = useState(false);

  const refresh = useCallback(async () => {
    setHasItems(await checkClassicCart());
  }, []);

  useEffect(() => {
    refresh();

    const onChange = () => {
      refresh();
    };

    window.addEventListener(CHECKOUT_CART_CHANGED, onChange);
    window.addEventListener("focus", onChange);
    document.addEventListener("visibilitychange", onChange);

    return () => {
      window.removeEventListener(CHECKOUT_CART_CHANGED, onChange);
      window.removeEventListener("focus", onChange);
      document.removeEventListener("visibilitychange", onChange);
    };
  }, [refresh]);

  return { hasItems, refresh };
}
