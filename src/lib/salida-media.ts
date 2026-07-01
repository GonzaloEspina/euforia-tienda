import { staticUrl } from "@/lib/config";
import type { MedioItem, Salida } from "@/types/salida";

/** Logo con fondo azul (legible sobre cards blancas y fondo celeste). */
export const DEFAULT_SALIDA_IMAGE = staticUrl("/logo.png");

export function isDefaultSalidaImage(url: string): boolean {
  return url.includes("/logo.png");
}

export function getSalidaCoverImage(salida: Salida): string {
  return salida.imagenes[0] ?? DEFAULT_SALIDA_IMAGE;
}

export function getSalidaMedios(salida: Salida): MedioItem[] {
  if (salida.medios.some((m) => m.tipo === "imagen")) {
    return salida.medios;
  }

  return [
    {
      url: DEFAULT_SALIDA_IMAGE,
      tipo: "imagen",
      alt: salida.titulo,
      principal: true,
    },
    ...salida.medios,
  ];
}
