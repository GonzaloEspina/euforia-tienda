"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/config";

export interface CuponAplicado {
  code: string;
  discountType: "percent" | "fixed_cart" | "fixed_product";
  amount: string;
}

interface Props {
  onCuponChange: (cupon: CuponAplicado | null) => void;
  disabled?: boolean;
}

export function CuponDescuento({ onCuponChange, disabled }: Props) {
  const [input, setInput] = useState("");
  const [aplicado, setAplicado] = useState<CuponAplicado | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aplicar = async () => {
    const code = input.trim();
    if (!code) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${apiUrl("/api/coupon")}?code=${encodeURIComponent(code)}`
      );
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setError(data.error ?? "Cupón no válido");
        setAplicado(null);
        onCuponChange(null);
        return;
      }

      const cupon: CuponAplicado = {
        code: data.code,
        discountType: data.discountType,
        amount: data.amount,
      };
      setAplicado(cupon);
      setInput(data.code);
      onCuponChange(cupon);
    } catch {
      setError("No se pudo validar el cupón");
      setAplicado(null);
      onCuponChange(null);
    } finally {
      setLoading(false);
    }
  };

  const quitar = () => {
    setInput("");
    setAplicado(null);
    setError(null);
    onCuponChange(null);
  };

  const labelDescuento = aplicado
    ? aplicado.discountType === "percent"
      ? `${aplicado.amount}% de descuento`
      : `$${aplicado.amount} de descuento`
    : null;

  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4 space-y-3">
      <p className="text-sm font-semibold text-travel-ink">
        Cupón de descuento{" "}
        <span className="font-normal text-travel-ink-muted">(opcional)</span>
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value.toUpperCase());
            if (aplicado) {
              setAplicado(null);
              onCuponChange(null);
            }
            setError(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && aplicar()}
          placeholder="EJ: VERANO10"
          disabled={disabled || loading || Boolean(aplicado)}
          className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white border border-sky-200 text-travel-ink text-sm uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-euforia-sky/40 disabled:opacity-60"
        />
        {aplicado ? (
          <button
            type="button"
            onClick={quitar}
            className="shrink-0 px-3 py-2 rounded-lg text-sm font-semibold border border-sky-200 text-travel-ink-muted hover:bg-white transition-colors"
          >
            Quitar
          </button>
        ) : (
          <button
            type="button"
            onClick={aplicar}
            disabled={disabled || loading || !input.trim()}
            className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-sky-200 text-euforia-sky-dark hover:bg-sky-50 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Aplicar"}
          </button>
        )}
      </div>

      {aplicado && labelDescuento && (
        <p className="text-sm text-emerald-700 font-medium flex items-center gap-1.5">
          <span aria-hidden>✓</span>
          Cupón <strong>{aplicado.code}</strong> aplicado — {labelDescuento}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
