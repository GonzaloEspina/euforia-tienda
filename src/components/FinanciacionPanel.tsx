"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { useFinanciacion } from "@/hooks/useFinanciacion";
import { getFinanciacionLabel } from "@/lib/salida-display";
import type { TarjetaFinanciacion } from "@/types/financiacion";
import { TarjetaFinanciacionSelector } from "./TarjetaFinanciacionSelector";

interface Props {
  priceArs?: number;
  senaPorcentaje?: number;
  maxCuotas?: number;
  precioListaParaCuotas?: boolean;
}

export function FinanciacionPanel({
  priceArs,
  senaPorcentaje = 15,
  maxCuotas = 12,
  precioListaParaCuotas = false,
}: Props) {
  const [pasajeros, setPasajeros] = useState(1);
  const [tarjeta, setTarjeta] = useState<TarjetaFinanciacion>("visa");
  const { data, loading } = useFinanciacion(
    priceArs,
    pasajeros,
    senaPorcentaje,
    tarjeta
  );
  const error = !loading && !data && Boolean(priceArs && priceArs > 0);

  if (!priceArs || priceArs <= 0) {
    return (
      <div className="rounded-xl bg-sky-50 border border-sky-100 p-4">
        <p className="text-sm font-semibold text-euforia-sky-dark mb-1">
          Financiación en cuotas
        </p>
        <p className="text-base text-travel-ink-muted">
          {getFinanciacionLabel(maxCuotas)}. Consultá con un asesor.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-sky-50 border border-sky-100 p-4 space-y-4">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-semibold text-euforia-sky-dark mb-1">
            Seña {senaPorcentaje}%
            {data && (
              <span className="text-travel-ink font-bold ml-2">
                {formatMoney(data.senaMonto, "ARS")}
              </span>
            )}
          </p>
          <p className="text-sm text-travel-ink-muted">
            por {pasajeros} pasajero{pasajeros === 1 ? "" : "s"} · cuotas sobre
            el saldo restante
          </p>
        </div>
        <label className="text-sm text-travel-ink-muted block">
          Pasajeros
          <select
            value={pasajeros}
            onChange={(e) => setPasajeros(Number(e.target.value))}
            className="mt-1 block w-full max-w-[8rem] px-2 py-1.5 rounded-lg bg-white border border-sky-200 text-travel-ink text-sm"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-euforia-sky-dark flex items-center gap-2">
            <span aria-hidden>💳</span> Financiación en cuotas
          </p>
          <div>
            <p className="text-xs text-travel-ink-muted mb-1.5">Estimar con</p>
            <TarjetaFinanciacionSelector
              value={tarjeta}
              onChange={setTarjeta}
              compact
            />
          </div>
        </div>

        {loading && (
          <p className="text-sm text-travel-ink-muted">Calculando cuotas...</p>
        )}

        {error && !loading && (
          <p className="text-sm text-travel-ink-muted">
            {getFinanciacionLabel(maxCuotas)}. No pudimos cargar las cuotas en
            este momento.
          </p>
        )}

        {data && data.cuotas.length > 0 && !loading && (
          <div className="grid grid-cols-2 gap-2">
            {data.cuotas.map((cuota) => (
              <div
                key={cuota.installments}
                className="flex flex-col items-center justify-center rounded-lg bg-white border border-sky-100 px-2 py-2.5 min-h-[4rem] text-center shadow-sm"
              >
                <p className="text-[11px] leading-tight text-travel-ink-muted mb-1">
                  {cuota.installments} cuotas
                </p>
                <p className="text-xs font-bold text-travel-ink leading-tight tabular-nums">
                  {formatMoney(cuota.installmentAmount, "ARS")}
                </p>
              </div>
            ))}
          </div>
        )}

        {data && data.cuotas.length === 0 && !loading && !error && (
          <p className="text-sm text-travel-ink-muted">
            {getFinanciacionLabel(maxCuotas)} para este monto.
          </p>
        )}

        {precioListaParaCuotas && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
            La promo efectivo aplica solo al pago en efectivo. Las cuotas se
            calculan sobre el precio de lista.
          </p>
        )}

        <p className="text-xs text-travel-ink-muted">
          Mercado Pago · estimación referencial según tarjeta elegida
        </p>
      </div>
    </div>
  );
}
