"use client";

import type { Salida } from "@/types/salida";

interface DetailRow {
  label: string;
  value: string | string[];
  icon: string;
}

const DETAIL_ICONS: Record<string, string> = {
  Fecha: "📅",
  Categoría: "🏷️",
  Subcategorías: "📂",
  Etiquetas: "🏷️",
  Destino: "🗺️",
  País: "🌎",
  Origen: "📍",
  Transporte: "🚌",
  Servicio: "🛎️",
  Noches: "🌙",
};

export function SalidaDetails({ salida }: { salida: Salida }) {
  const rows: DetailRow[] = [];

  const add = (label: string, value?: string | string[] | number) => {
    if (value == null || value === "" || (Array.isArray(value) && !value.length))
      return;
    rows.push({
      label,
      value: Array.isArray(value) ? value : String(value),
      icon: DETAIL_ICONS[label] ?? "•",
    });
  };

  add("Fecha", salida.fecha);
  add("Categoría", salida.categoria);
  add("Subcategorías", salida.subcategorias);
  add("Etiquetas", salida.etiquetas);
  add("Destino", salida.destino);
  add("País", salida.pais);
  add("Origen", salida.origen);
  add("Transporte", salida.transporte);
  add("Servicio", salida.servicio);
  add("Noches", salida.noches ? `${salida.noches} noches` : undefined);

  if (!rows.length) return null;

  return (
    <div className="glass rounded-2xl overflow-hidden shadow-card border border-sky-100">
      <div className="bg-gradient-to-r from-sky-50 to-white px-6 py-4 border-b border-sky-100">
        <h2 className="text-xl font-bold text-travel-ink flex items-center gap-2">
          <span aria-hidden>📋</span>
          Detalles del viaje
        </h2>
      </div>

      <div className="p-5 md:p-6">
        <dl className="grid sm:grid-cols-2 gap-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex gap-3 rounded-xl bg-white border border-sky-100 p-4 shadow-sm"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-lg"
                aria-hidden
              >
                {row.icon}
              </span>
              <div className="min-w-0 space-y-1">
                <dt className="text-xs uppercase tracking-widest text-travel-ink-muted font-medium">
                  {row.label}
                </dt>
                <dd className="text-base font-semibold text-travel-ink leading-snug">
                  {Array.isArray(row.value) ? (
                    <div className="flex flex-wrap gap-1.5">
                      {row.value.map((v) => (
                        <span
                          key={v}
                          className="px-2.5 py-1 rounded-full bg-sky-50 text-sm border border-sky-100 text-travel-ink font-medium"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
