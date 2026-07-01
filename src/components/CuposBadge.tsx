"use client";

import type { Salida } from "@/types/salida";
import {
  getCuposUrgency,
  type CuposUrgencyVariant,
} from "@/lib/salida-display";

const STYLES: Record<CuposUrgencyVariant, string> = {
  critical:
    "bg-red-50 border-red-200 text-red-800 ring-1 ring-red-100",
  low: "bg-amber-50 border-amber-200 text-amber-900 ring-1 ring-amber-100",
  normal:
    "bg-white border-sky-200 text-euforia-sky-dark ring-1 ring-sky-100",
  soldout: "bg-slate-100 border-slate-200 text-slate-600",
};

export function CuposBadge({ salida }: { salida: Salida }) {
  const cupos = getCuposUrgency(salida);
  if (!cupos.show) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm ${STYLES[cupos.variant]}`}
      role="status"
    >
      {cupos.message}
    </div>
  );
}
