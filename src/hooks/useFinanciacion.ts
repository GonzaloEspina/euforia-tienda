"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/config";
import type { FinanciacionResult } from "@/lib/mercadopago";
import type { TarjetaFinanciacion } from "@/types/financiacion";

const cache = new Map<string, FinanciacionResult>();
const inflight = new Map<string, Promise<FinanciacionResult | null>>();

function cacheKey(
  amount: number,
  pasajeros: number,
  sena: number,
  tarjeta: TarjetaFinanciacion
) {
  return `${amount}-${pasajeros}-${sena}-${tarjeta}`;
}

async function fetchFinanciacion(
  amount: number,
  pasajeros: number,
  sena: number,
  tarjeta: TarjetaFinanciacion
): Promise<FinanciacionResult | null> {
  const key = cacheKey(amount, pasajeros, sena, tarjeta);
  if (cache.has(key)) return cache.get(key)!;

  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = (async () => {
    const params = new URLSearchParams({
      amount: String(amount),
      pasajeros: String(pasajeros),
      sena: String(sena),
      tarjeta,
    });
    const res = await fetch(apiUrl(`/api/financiacion?${params.toString()}`));
    const json = (await res.json()) as {
      ok: boolean;
      data?: FinanciacionResult;
    };
    if (!res.ok || !json.ok || !json.data) return null;
    cache.set(key, json.data);
    return json.data;
  })();

  inflight.set(key, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(key);
  }
}

export function useFinanciacion(
  priceArs: number | undefined,
  pasajeros = 1,
  senaPorcentaje = 15,
  tarjeta: TarjetaFinanciacion = "visa"
) {
  const [data, setData] = useState<FinanciacionResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!priceArs || priceArs <= 0) {
      setData(null);
      setLoading(false);
      return;
    }

    const key = cacheKey(priceArs, pasajeros, senaPorcentaje, tarjeta);
    if (cache.has(key)) {
      setData(cache.get(key)!);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchFinanciacion(priceArs, pasajeros, senaPorcentaje, tarjeta).then(
      (result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [priceArs, pasajeros, senaPorcentaje, tarjeta]);

  return { data, loading };
}
