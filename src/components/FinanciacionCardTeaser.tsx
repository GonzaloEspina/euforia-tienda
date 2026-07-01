"use client";

import { formatMoney } from "@/lib/format";
import { getFinanciacionLabel } from "@/lib/salida-display";

interface Props {
  priceArs?: number;
  senaPorcentaje?: number;
  maxCuotas?: number;
}

export function FinanciacionCardTeaser({
  priceArs,
  senaPorcentaje = 15,
  maxCuotas = 12,
}: Props) {
  if (!priceArs || priceArs <= 0) {
    return (
      <p className="text-sm text-travel-ink-muted">
        {getFinanciacionLabel(maxCuotas)}
      </p>
    );
  }

  const senaMonto = Math.round(priceArs * (senaPorcentaje / 100));

  return (
    <div className="rounded-xl bg-sky-50 border border-sky-100 px-3 py-2.5 space-y-1">
      <p className="text-sm text-travel-ink">
        Seña {senaPorcentaje}%:{" "}
        <span className="font-bold text-euforia-sky-dark">
          {formatMoney(senaMonto, "ARS")}
        </span>
      </p>
      <p className="text-sm text-travel-ink-muted">
        {getFinanciacionLabel(maxCuotas)}
      </p>
      <p className="text-[0.7rem] text-travel-ink-muted leading-tight">
        Mercado Pago · valores referenciales
      </p>
    </div>
  );
}
