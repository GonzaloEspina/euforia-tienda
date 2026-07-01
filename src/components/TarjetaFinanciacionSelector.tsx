"use client";

import type { TarjetaFinanciacion } from "@/types/financiacion";
import { TARJETA_FINANCIACION_OPTIONS } from "@/types/financiacion";

interface Props {
  value: TarjetaFinanciacion;
  onChange: (value: TarjetaFinanciacion) => void;
  compact?: boolean;
}

export function TarjetaFinanciacionSelector({
  value,
  onChange,
  compact = false,
}: Props) {
  return (
    <div
      className={compact ? "flex flex-wrap gap-1.5" : "flex flex-wrap gap-2"}
      role="group"
      aria-label="Tarjeta para estimar financiación"
    >
      {TARJETA_FINANCIACION_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`rounded-lg font-medium border transition-all ${
            compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
          } ${
            value === option.id
              ? "bg-euforia-sky-dark text-white border-euforia-sky-dark"
              : "bg-white text-travel-ink-muted border-sky-200 hover:border-euforia-sky/50 hover:text-travel-ink"
          }`}
          aria-pressed={value === option.id}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
