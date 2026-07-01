"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/config";

const CART_TOKEN_KEY = "euforia-cart-token";
const CART_NONCE_KEY = "euforia-cart-nonce";

function storeCartHeaders(res: Response) {
  const cartToken = res.headers.get("Cart-Token");
  if (cartToken) sessionStorage.setItem(CART_TOKEN_KEY, cartToken);

  const nonce = res.headers.get("Nonce");
  if (nonce) sessionStorage.setItem(CART_NONCE_KEY, nonce);
}

function cartRequestHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const cartToken = sessionStorage.getItem(CART_TOKEN_KEY);
  if (cartToken) headers["Cart-Token"] = cartToken;
  const nonce = sessionStorage.getItem(CART_NONCE_KEY);
  if (nonce) headers.Nonce = nonce;
  return headers;
}

interface Props {
  salidaId: number;
  couponCode?: string;
  className?: string;
  children: React.ReactNode;
}

export function ComprarAhoraButton({
  salidaId,
  couponCode,
  className,
  children,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl("/api/cart/buy-now"), {
        method: "POST",
        credentials: "include",
        headers: cartRequestHeaders(),
        body: JSON.stringify({
          id: salidaId,
          coupon: couponCode,
        }),
      });

      storeCartHeaders(res);
      const data = (await res.json()) as {
        ok?: boolean;
        checkoutUrl?: string;
        message?: string;
        couponApplied?: boolean;
        couponCode?: string;
      };

      if (res.ok && data.checkoutUrl) {
        let url = data.checkoutUrl;
        if (data.couponCode && data.couponApplied === false) {
          const separator = url.includes("?") ? "&" : "?";
          url += `${separator}apply_coupon=${encodeURIComponent(data.couponCode)}`;
        }
        window.location.replace(url);
        return;
      }

      throw new Error(data.message ?? "No se pudo iniciar la compra");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al comprar");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={className}
      >
        {loading ? "Redirigiendo..." : children}
      </button>
      {error && (
        <p className="text-sm text-red-500 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
