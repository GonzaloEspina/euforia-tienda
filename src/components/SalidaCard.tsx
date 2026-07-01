"use client";

import Image from "next/image";
import Link from "next/link";
import type { Salida } from "@/types/salida";
import { usePreferences } from "@/context/PreferencesContext";
import { getPriceDisplays } from "@/lib/format";
import { getSalidaMetaChips, getFinanciacionBaseArs, shouldUseCotizacionUsd } from "@/lib/salida-display";
import { getSalidaCoverImage, isDefaultSalidaImage } from "@/lib/salida-media";
import { FinanciacionCardTeaser } from "./FinanciacionCardTeaser";

export function SalidaCard({ salida }: { salida: Salida }) {
  const { priceMode } = usePreferences();
  const prices = getPriceDisplays(salida, priceMode);
  const primaryPrice = prices[0];
  const image = getSalidaCoverImage(salida);
  const isPlaceholder = isDefaultSalidaImage(image);
  const metaChips = getSalidaMetaChips(salida);
  const priceArs = getFinanciacionBaseArs(salida);
  const cotizarUsd = shouldUseCotizacionUsd(salida, priceMode);
  const showFinancing = !cotizarUsd && Boolean(priceArs);
  const ultimosCupos =
    salida.estado?.toLowerCase().includes("últim") ||
    salida.estado?.toLowerCase().includes("ultim");

  return (
    <article className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-sky-100 shadow-lg shadow-sky-100/60 hover:shadow-xl hover:shadow-sky-200/80 hover:border-euforia-sky/40 transition-all duration-300 animate-slide-up">
      <Link href={`/salida/${salida.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-sky-100">
        <Image
          src={image}
          alt={salida.titulo}
          fill
          className={
            isPlaceholder
              ? "object-contain p-6 bg-sky-50"
              : "object-cover transition-transform duration-500 group-hover:scale-105"
          }
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-travel-ink/50 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {salida.enPromocion && (
            <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-amber-400 text-amber-950 shadow-sm">
              Promo
            </span>
          )}
          {salida.destacado && (
            <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-white text-euforia-sky-dark shadow-sm">
              Destacado
            </span>
          )}
        </div>

        {salida.categoria && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/95 text-euforia-sky-dark shadow-sm">
            {salida.categoria}
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1 gap-3">
        {salida.fecha && (
          <span className="inline-flex self-start px-3 py-1 rounded-lg bg-euforia-sky-dark text-white text-sm font-bold shadow-sm">
            {salida.fecha}
          </span>
        )}

        <Link href={`/salida/${salida.slug}`}>
          <h3 className="font-bold text-lg leading-snug line-clamp-2 text-travel-ink group-hover:text-euforia-sky-dark transition-colors">
            {salida.titulo}
          </h3>
        </Link>

        {metaChips.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm text-travel-ink-muted">
            {metaChips.map((chip) => (
              <span key={chip.label} className="inline-flex items-center gap-1">
                <span aria-hidden>{chip.icon}</span>
                {chip.label}
              </span>
            ))}
          </div>
        )}

        {ultimosCupos && (
          <p className="text-sm font-semibold text-amber-600">
            🔥 ¡Últimos cupos disponibles!
          </p>
        )}

        <div className="mt-auto space-y-2">
          {primaryPrice ? (
            <>
              <div className="flex items-baseline gap-2 flex-wrap">
                {primaryPrice.original && (
                  <span className="text-base text-travel-ink-muted line-through">
                    {primaryPrice.original}
                  </span>
                )}
                <span
                  className={`text-2xl font-bold ${primaryPrice.promo ? "text-amber-600" : "text-euforia-sky-dark"}`}
                >
                  {primaryPrice.main}
                </span>
                <span className="text-sm text-travel-ink-muted">/ persona</span>
              </div>
              {prices.length > 1 && (
                <p className="text-sm text-travel-ink-muted">{prices[1].main}</p>
              )}
            </>
          ) : (
            <p className="text-base text-travel-ink-muted">Consultá precio</p>
          )}

          {showFinancing ? (
            <FinanciacionCardTeaser
              priceArs={priceArs}
              senaPorcentaje={salida.porcentajeSena}
              maxCuotas={salida.maxCuotas}
            />
          ) : cotizarUsd ? (
            <p className="text-sm text-travel-ink-muted">
              Compra en USD vía cotización con un asesor
            </p>
          ) : (
            <p className="text-sm text-travel-ink-muted">
              Consultá financiación con un asesor
            </p>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 flex gap-2">
        {cotizarUsd ? (
          <>
            <Link
              href={`/cotizar/${salida.slug}`}
              className="flex-1 py-3 rounded-xl font-bold text-base text-center bg-euforia-sky-dark hover:bg-euforia-sky text-white transition-all shadow-sm"
            >
              Cotizar en dólares
            </Link>
            <Link
              href={`/salida/${salida.slug}`}
              className="shrink-0 px-4 py-3 rounded-xl font-semibold text-base border-2 border-euforia-sky-dark text-euforia-sky-dark hover:bg-sky-50 transition-all"
              title="Ver detalle"
              aria-label="Ver detalle"
            >
              →
            </Link>
          </>
        ) : (
          <>
            <Link
              href={`/salida/${salida.slug}`}
              className="flex-1 py-3 rounded-xl font-bold text-base text-center bg-euforia-sky-dark hover:bg-euforia-sky text-white transition-all shadow-sm"
            >
              Ver detalle
            </Link>
            <Link
              href={`/cotizar/${salida.slug}`}
              className="shrink-0 px-4 py-3 rounded-xl font-semibold text-base border-2 border-euforia-sky-dark text-euforia-sky-dark hover:bg-sky-50 transition-all"
              title="Solicitar cotización"
              aria-label="Solicitar cotización"
            >
              💬
            </Link>
          </>
        )}
      </div>
    </article>
  );
}
