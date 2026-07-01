"use client";

import Link from "next/link";
import { useState } from "react";
import type { Salida } from "@/types/salida";
import { MediaGallery } from "./MediaGallery";
import { SalidaDetails } from "./SalidaDetails";
import { FinanciacionPanel } from "./FinanciacionPanel";
import { UsdPurchaseNotice } from "./UsdPurchaseNotice";
import { CuposBadge } from "./CuposBadge";
import { ShareSalidaButton } from "./ShareSalidaButton";
import { PriceModeToggle } from "./PriceModeToggle";
import { PoliticaCancelacion } from "./PoliticaCancelacion";
import { CuponDescuento, type CuponAplicado } from "./CuponDescuento";
import { PaquetesSimilares } from "./PaquetesSimilares";
import { AsideLayout, AsideAwareSection } from "./AsideLayout";
import { usePreferences } from "@/context/PreferencesContext";
import { useRegisterWhatsAppSalida } from "@/context/WhatsAppContext";
import { decodeHtmlEntities, getPriceDisplays } from "@/lib/format";
import {
  canPurchaseOnline,
  getDirectPurchaseUrl,
  getFinanciacionBaseArs,
  getSalidaMetaChips,
  shouldUseCotizacionUsd,
  usesListaPriceForFinanciacion,
} from "@/lib/salida-display";
import { getSalidaMedios } from "@/lib/salida-media";

function TituloSalidaCard({
  salida,
  titulo,
  metaChips,
}: {
  salida: Salida;
  titulo: string;
  metaChips: ReturnType<typeof getSalidaMetaChips>;
}) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white/80 backdrop-blur-sm p-5 md:p-6 space-y-5 shadow-card">
      {salida.categoria && (
        <p className="text-sm uppercase tracking-widest text-euforia-sky-dark font-bold">
          {salida.categoria}
          {salida.subcategorias.length > 0 &&
            ` · ${salida.subcategorias.join(" · ")}`}
        </p>
      )}

      <h1 className="text-3xl md:text-4xl font-bold leading-tight text-travel-ink">
        {titulo}
      </h1>

      {metaChips.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {metaChips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-100 text-sm font-medium text-travel-ink"
            >
              <span aria-hidden>{chip.icon}</span>
              {chip.label}
            </span>
          ))}
        </div>
      )}

      {salida.fecha && (
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-euforia-sky-dark text-white font-bold text-base shadow-sm">
          <span aria-hidden>📅</span>
          Salida: {salida.fecha}
        </div>
      )}

      {(salida.destacado || salida.enPromocion) && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-sky-100">
          {salida.destacado && (
            <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-sky-100 text-euforia-sky-dark border border-sky-200">
              ⭐ Salida destacada
            </span>
          )}
          {salida.enPromocion && (
            <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-amber-50 text-amber-700 border border-amber-200">
              🏷️ En promoción
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function SalidaDetailView({
  salida,
  similares = [],
}: {
  salida: Salida;
  similares?: Salida[];
}) {
  const { priceMode } = usePreferences();
  const [cupon, setCupon] = useState<CuponAplicado | null>(null);
  const prices = getPriceDisplays(salida, priceMode);
  const metaChips = getSalidaMetaChips(salida);
  const purchaseUrl = getDirectPurchaseUrl(salida.id, cupon?.code);
  const priceArsFinanciacion = getFinanciacionBaseArs(salida);
  const precioListaParaCuotas = usesListaPriceForFinanciacion(salida);
  const cotizarUsd = shouldUseCotizacionUsd(salida, priceMode);
  const puedeComprar = canPurchaseOnline(salida, priceMode);
  const cotizarUrl = `/cotizar/${salida.slug}`;
  const titulo = decodeHtmlEntities(salida.titulo);

  useRegisterWhatsAppSalida(titulo);

  const renderPricingCard = (showMobileToggle: boolean) => (
    <div className="glass rounded-2xl p-5 md:p-6 space-y-4 border border-sky-100 shadow-card">
      {showMobileToggle && (
        <div className="sm:hidden">
          <PriceModeToggle compact fullWidth />
        </div>
      )}

      <div className="flex justify-end">
        <ShareSalidaButton slug={salida.slug} />
      </div>

      {prices.length > 0 ? (
        <div className="space-y-4">
          {prices.map((p) => (
            <div
              key={p.currency}
              className="pb-4 border-b border-sky-100 last:border-0 last:pb-0"
            >
              <p className="text-sm text-travel-ink-muted uppercase tracking-wide mb-1">
                {p.label}
              </p>
              <div className="flex items-baseline gap-3 flex-wrap">
                {p.original && (
                  <span className="text-xl text-travel-ink-muted line-through">
                    {p.original}
                  </span>
                )}
                <span
                  className={`text-3xl md:text-4xl font-bold ${p.promo ? "text-amber-600" : "text-euforia-sky-dark"}`}
                >
                  {p.main}
                </span>
                <span className="text-sm text-travel-ink-muted">/ persona</span>
                {p.promo && (
                  <span className="text-sm font-bold uppercase text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Promo efectivo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-base text-travel-ink-muted">
          Consultá precio con la agencia
        </p>
      )}

      {cotizarUsd ? (
        <UsdPurchaseNotice />
      ) : (
        <FinanciacionPanel
          priceArs={priceArsFinanciacion}
          senaPorcentaje={salida.porcentajeSena ?? 15}
          maxCuotas={salida.maxCuotas}
          precioListaParaCuotas={precioListaParaCuotas}
        />
      )}

      {!cotizarUsd && puedeComprar && (
        <CuponDescuento onCuponChange={setCupon} />
      )}

      {cotizarUsd ? (
        salida.isInStock ? (
          <Link
            href={cotizarUrl}
            className="block w-full py-3.5 rounded-xl font-bold text-base text-center text-white bg-euforia-sky-dark hover:bg-euforia-sky transition-all shadow-sm"
          >
            Solicitar cotización en dólares
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="w-full py-3.5 rounded-xl font-bold text-base text-white bg-euforia-sky-dark opacity-40 cursor-not-allowed"
          >
            Sin cupos disponibles
          </button>
        )
      ) : puedeComprar ? (
        <a
          href={purchaseUrl}
          className="block w-full py-3.5 rounded-xl font-bold text-base text-center text-white bg-euforia-sky-dark hover:bg-euforia-sky transition-all shadow-sm"
        >
          Comprar ahora
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="w-full py-3.5 rounded-xl font-bold text-base text-white bg-euforia-sky-dark opacity-40 cursor-not-allowed"
        >
          Sin cupos disponibles
        </button>
      )}

      {!cotizarUsd && (
        <Link
          href={cotizarUrl}
          className="block w-full py-3.5 rounded-xl font-semibold text-base text-center border-2 border-euforia-sky-dark text-euforia-sky-dark hover:bg-sky-50 transition-all"
        >
          Solicitar cotización
        </Link>
      )}

      {salida.itinerarioUrl && (
        <a
          href={salida.itinerarioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-euforia-sky-dark text-euforia-sky-dark hover:bg-sky-50 transition-all font-medium text-base"
        >
          📋 Ver itinerario completo
        </a>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AsideLayout
        key={`${priceMode}-${cotizarUsd}`}
        pricing={renderPricingCard(false)}
      >
        <AsideAwareSection>
          <MediaGallery medios={getSalidaMedios(salida)} />
        </AsideAwareSection>

        <AsideAwareSection>
          <CuposBadge salida={salida} />
        </AsideAwareSection>

        <AsideAwareSection>
          <TituloSalidaCard
            salida={salida}
            titulo={titulo}
            metaChips={metaChips}
          />
        </AsideAwareSection>

        <div className="md:hidden">{renderPricingCard(true)}</div>

        {salida.descripcion && (
          <AsideAwareSection>
            <div className="glass rounded-2xl overflow-hidden shadow-card border border-sky-100">
              <div className="bg-gradient-to-r from-sky-50 to-white px-6 py-4 border-b border-sky-100">
                <h2 className="text-xl font-bold text-travel-ink flex items-center gap-2">
                  <span aria-hidden>✈️</span>
                  Sobre este viaje
                </h2>
              </div>
              <div className="p-6 md:p-8 text-travel-ink-muted leading-relaxed whitespace-pre-line text-base">
                {decodeHtmlEntities(salida.descripcion)}
              </div>
            </div>
          </AsideAwareSection>
        )}

        <AsideAwareSection>
          <SalidaDetails salida={salida} />
        </AsideAwareSection>

        <AsideAwareSection>
          <PoliticaCancelacion salida={salida} />
        </AsideAwareSection>
      </AsideLayout>

      <PaquetesSimilares salidas={similares} />
    </div>
  );
}
