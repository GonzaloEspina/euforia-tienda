"use client";

import { usePreferences } from "@/context/PreferencesContext";
import type { PriceCurrencyMode } from "@/types/salida";

const MODES: { value: PriceCurrencyMode; label: string; short: string }[] = [
  { value: "ars", label: "Pesos (ARS)", short: "ARS" },
  { value: "usd", label: "Dólares (USD)", short: "USD" },
  { value: "both", label: "Ambas monedas", short: "ARS+USD" },
];

export function PriceModeToggle({
  compact = false,
  fullWidth = false,
  inverted = false,
}: {
  compact?: boolean;
  fullWidth?: boolean;
  inverted?: boolean;
}) {
  const { priceMode, setPriceMode } = usePreferences();

  if (compact) {
    return (
      <div
        className={`flex items-center rounded-xl p-0.5 shrink-0 ${
          inverted
            ? "bg-white/15 border border-white/20"
            : "bg-sky-50 border border-sky-200"
        } ${fullWidth ? "w-full" : ""}`}
        role="group"
        aria-label="Moneda de precios"
      >
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setPriceMode(m.value)}
            className={`px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              fullWidth ? "flex-1 text-center" : ""
            } ${
              priceMode === m.value
                ? inverted
                  ? "bg-white text-euforia-sky-dark shadow-sm"
                  : "bg-euforia-sky-dark text-white shadow-sm"
                : inverted
                  ? "text-white/85 hover:text-white"
                  : "text-travel-ink-muted hover:text-euforia-sky-dark"
            }`}
            aria-pressed={priceMode === m.value}
          >
            {m.short}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-base font-medium mb-3 text-travel-ink-muted">
        Ver precios en
      </p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Moneda de precios">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setPriceMode(m.value)}
            className={`px-4 py-2.5 rounded-xl text-base font-semibold border transition-all ${
              priceMode === m.value
                ? "bg-sky-100 border-euforia-sky text-euforia-sky-dark"
                : "border-sky-200 text-travel-ink-muted hover:border-euforia-sky/40 hover:text-travel-ink"
            }`}
            aria-pressed={priceMode === m.value}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
