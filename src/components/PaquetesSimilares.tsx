"use client";

import Image from "next/image";
import Link from "next/link";
import type { Salida } from "@/types/salida";
import { usePreferences } from "@/context/PreferencesContext";
import { decodeHtmlEntities, getPriceDisplays } from "@/lib/format";
import { getSalidaCoverImage, isDefaultSalidaImage } from "@/lib/salida-media";

export function PaquetesSimilares({ salidas }: { salidas: Salida[] }) {
  const { priceMode } = usePreferences();

  if (!salidas.length) return null;

  return (
    <section className="mt-12 mb-4">
      <h2 className="text-2xl font-bold text-travel-ink mb-6">
        Paquetes similares
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {salidas.map((salida) => {
          const prices = getPriceDisplays(salida, priceMode);
          const price = prices[0];
          const image = getSalidaCoverImage(salida);
          const placeholder = isDefaultSalidaImage(image);

          return (
            <Link
              key={salida.id}
              href={`/salida/${salida.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-sky-100 shadow-card hover:shadow-lg hover:border-euforia-sky/30 transition-all"
            >
              <div className="relative aspect-[16/10] bg-sky-100 overflow-hidden">
                <Image
                  src={image}
                  alt={salida.titulo}
                  fill
                  className={
                    placeholder
                      ? "object-contain p-6 bg-sky-50"
                      : "object-cover transition-transform duration-300 group-hover:scale-105"
                  }
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-travel-ink leading-snug line-clamp-2 group-hover:text-euforia-sky-dark transition-colors">
                  {decodeHtmlEntities(salida.titulo)}
                </h3>
                {price?.main ? (
                  <p className="text-lg font-bold text-euforia-sky-dark">
                    {price.main}
                    <span className="text-sm font-normal text-travel-ink-muted">
                      {" "}
                      / persona
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-travel-ink-muted">
                    Consultá precio
                  </p>
                )}
                {salida.noches && (
                  <p className="text-sm text-travel-ink-muted">
                    🌙 {salida.noches} noches
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
