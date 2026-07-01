"use client";

import { formatMoney } from "@/lib/format";
import { useFinanciacion } from "@/hooks/useFinanciacion";
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
  const { data, loading } = useFinanciacion(priceArs, 1, senaPorcentaje);

  if (!priceArs || priceArs <= 0) {
    return (
      <p className="text-sm text-travel-ink-muted">
        {getFinanciacionLabel(maxCuotas)}
      </p>
    );
  }

  const cuotaDestacada =
    data?.cuotas.find((c) => c.installments === 12) ??
    data?.cuotas[data.cuotas.length - 1];

  const senaMonto =
    data?.senaMonto ?? Math.round(priceArs * (senaPorcentaje / 100));

  return (
    <div className="rounded-xl bg-sky-50 border border-sky-100 px-3 py-2.5 space-y-1">
      <p className="text-sm text-travel-ink">
        Seña {senaPorcentaje}%:{" "}
        <span className="font-bold text-euforia-sky-dark">
          {formatMoney(senaMonto, "ARS")}
        </span>
      </p>

      {loading && (
        <p className="text-xs text-travel-ink-muted">Calculando cuotas...</p>
      )}

      {!loading && cuotaDestacada && (
        <p className="text-sm text-travel-ink">
          {cuotaDestacada.installments} cuotas de{" "}
          <span className="font-bold text-euforia-sky-dark">
            {formatMoney(cuotaDestacada.installmentAmount, "ARS")}
          </span>
        </p>
      )}

      {!loading && !cuotaDestacada && (
        <p className="text-sm text-travel-ink-muted">
          {getFinanciacionLabel(maxCuotas)}
        </p>
      )}

      <p className="text-[0.7rem] text-travel-ink-muted leading-tight">
        Mercado Pago · valores referenciales
      </p>
    </div>
  );
}
