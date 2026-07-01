"use client";

import { useState } from "react";
import { getCheckoutUrl, getWooSiteUrl } from "@/lib/checkout-url";
import { notifyCheckoutCartChanged } from "@/hooks/useCheckoutCart";
import { primeWooSession, waitForCartReady } from "@/lib/woo-session";

interface Props {
  salidaId: number;
  couponCode?: string;
  className?: string;
  children: React.ReactNode;
}

async function wooAjax(
  action: "add_to_cart" | "apply_coupon",
  params: Record<string, string>
): Promise<{ ok: boolean; message?: string }> {
  const wooUrl = getWooSiteUrl();
  const res = await fetch(`${wooUrl}/?wc-ajax=${action}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });

  const text = await res.text();
  if (!res.ok) {
    return { ok: false, message: text || "Error de WooCommerce" };
  }

  try {
    const data = JSON.parse(text) as { error?: boolean; message?: string };
    if (data.error) {
      return { ok: false, message: data.message ?? "No se pudo completar la acción" };
    }
  } catch {
    // Respuesta no JSON; si el status es 200, asumimos éxito.
  }

  return { ok: true };
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
      await primeWooSession();

      const added = await wooAjax("add_to_cart", {
        product_id: String(salidaId),
        quantity: "1",
      });

      if (!added.ok) {
        throw new Error(added.message ?? "No se pudo agregar el producto");
      }

      const code = couponCode?.trim();
      if (code) {
        await wooAjax("apply_coupon", { coupon_code: code });
      }

      await waitForCartReady();

      notifyCheckoutCartChanged();
      window.location.replace(getCheckoutUrl());
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
