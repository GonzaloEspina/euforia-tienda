"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MedioItem } from "@/types/salida";
import { isDefaultSalidaImage } from "@/lib/salida-media";

function isYoutubeOrVimeo(url: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

function embedUrl(url: string): string {
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("vimeo.com")) {
    const id = url.split("vimeo.com/")[1]?.split("?")[0];
    return `https://player.vimeo.com/video/${id}`;
  }
  return url;
}

export function MediaGallery({ medios }: { medios: MedioItem[] }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef(0);

  const imageIndices = useMemo(
    () =>
      medios
        .map((m, i) => (m.tipo === "imagen" ? i : -1))
        .filter((i) => i >= 0),
    [medios]
  );

  const current = medios[active];
  const canZoom =
    current?.tipo === "imagen" && !isDefaultSalidaImage(current.url);
  const lightboxPos = imageIndices.indexOf(active);

  const openLightbox = useCallback(() => {
    if (canZoom) setLightboxOpen(true);
  }, [canZoom]);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const goPrev = useCallback(() => {
    const pos = imageIndices.indexOf(active);
    if (pos > 0) setActive(imageIndices[pos - 1]);
    else if (imageIndices.length > 0)
      setActive(imageIndices[imageIndices.length - 1]);
  }, [active, imageIndices]);

  const goNext = useCallback(() => {
    const pos = imageIndices.indexOf(active);
    if (pos >= 0 && pos < imageIndices.length - 1)
      setActive(imageIndices[pos + 1]);
    else if (imageIndices.length > 0) setActive(imageIndices[0]);
  }, [active, imageIndices]);

  const handleLightboxTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? 0;
  }, []);

  const handleLightboxTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const endX = e.changedTouches[0]?.clientX ?? 0;
      const diff = touchStartX.current - endX;
      if (Math.abs(diff) < 48) return;
      if (diff > 0) goNext();
      else goPrev();
    },
    [goNext, goPrev]
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen, closeLightbox, goPrev, goNext]);

  if (!medios.length || !current) return null;

  return (
    <>
      <div className="space-y-3">
        <div
          className={`relative aspect-[16/10] rounded-2xl overflow-hidden bg-sky-100 border border-sky-200 shadow-card ${canZoom ? "cursor-zoom-in group" : ""}`}
          onClick={canZoom ? openLightbox : undefined}
          onKeyDown={
            canZoom
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") openLightbox();
                }
              : undefined
          }
          role={canZoom ? "button" : undefined}
          tabIndex={canZoom ? 0 : undefined}
          aria-label={canZoom ? "Ver imagen en grande" : undefined}
        >
          {current.tipo === "video" ? (
            isYoutubeOrVimeo(current.url) ? (
              <iframe
                src={embedUrl(current.url)}
                title="Video de la salida"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={current.url}
                controls
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
              />
            )
          ) : (
            <Image
              src={current.url}
              alt={current.alt ?? "Imagen de la salida"}
              fill
              className={
                isDefaultSalidaImage(current.url)
                  ? "object-contain p-10 bg-sky-50"
                  : "object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              }
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
          )}

          {canZoom && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openLightbox();
              }}
              className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-black/65 transition-colors"
            >
              <span aria-hidden>🔍</span>
              Ver en grande
            </button>
          )}
        </div>

        {medios.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
            {medios.map((m, i) => (
              <button
                key={`${m.url}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  active === i
                    ? "border-euforia-sky-dark"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {m.tipo === "video" ? (
                  <div className="absolute inset-0 bg-sky-200 flex items-center justify-center text-lg">
                    ▶
                  </div>
                ) : (
                  <Image
                    src={m.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && canZoom && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-fade-in"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Galería de imágenes"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white text-xl hover:bg-white/20 transition-colors"
            aria-label="Cerrar galería"
          >
            ×
          </button>

          {imageIndices.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white text-2xl hover:bg-white/20 transition-colors"
                aria-label="Imagen anterior"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white text-2xl hover:bg-white/20 transition-colors"
                aria-label="Imagen siguiente"
              >
                ›
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-5xl aspect-[16/10] touch-pan-y"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleLightboxTouchStart}
            onTouchEnd={handleLightboxTouchEnd}
          >
            <Image
              src={current.url}
              alt={current.alt ?? "Imagen de la salida"}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {imageIndices.length > 1 && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/80">
              {lightboxPos + 1} / {imageIndices.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
