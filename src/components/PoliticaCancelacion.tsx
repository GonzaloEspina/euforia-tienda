"use client";

import { useState } from "react";
import type { Salida } from "@/types/salida";

const PENALIDADES = [
  {
    plazo: "Más de 30 días antes",
    detalle: "Retención del 10% + IVA del total",
    nivel: "bajo" as const,
  },
  {
    plazo: "Entre 30 y 16 días antes",
    detalle: "Retención del 25% + IVA del total",
    nivel: "medio" as const,
  },
  {
    plazo: "Entre 15 días y 72 hs",
    detalle: "Retención del 50% + IVA del total",
    nivel: "alto" as const,
  },
  {
    plazo: "Menos de 72 hs o sin aviso",
    detalle: "100% del total — sin devolución",
    nivel: "critico" as const,
  },
];

const NIVEL_STYLES = {
  bajo: "border-sky-200 bg-sky-50/80",
  medio: "border-amber-200 bg-amber-50/80",
  alto: "border-orange-200 bg-orange-50/80",
  critico: "border-red-200 bg-red-50/80",
};

const CONDICIONES = [
  {
    titulo: "Inscripción",
    texto:
      "Se considera inscripto al pasajero una vez abonada la seña o acordadas las condiciones de pago. La inscripción implica aceptación plena de estas condiciones.",
  },
  {
    titulo: "Cancelación por el organizador",
    texto:
      "Euforia Viajes se reserva el derecho de cancelar una salida si el número de inscriptos no es suficiente, notificando con mínimo 7 días de anticipación. En ese caso se devuelve el 100% de lo abonado sin indemnización adicional.",
  },
  {
    titulo: "Equipaje",
    texto:
      "Hasta 20 kg de bodega + bolso de mano. El exceso puede tener costo adicional. El equipaje viaja por cuenta y riesgo del pasajero.",
  },
  {
    titulo: "Documentación",
    texto:
      "La obtención y vigencia de DNI, pasaporte, visas o certificados es responsabilidad exclusiva del pasajero. No se realizan reintegros por problemas de documentación.",
  },
  {
    titulo: "Reembolsos",
    texto:
      "Todo reclamo deberá presentarse por escrito dentro de los 30 días corridos posteriores a la finalización del tour. No se reembolsan servicios no utilizados por decisión del pasajero.",
  },
  {
    titulo: "Jurisdicción",
    texto:
      "Tribunales ordinarios de la ciudad de Trelew, Provincia del Chubut. Leg. 16816 — Vigencia: 01/10/2024.",
  },
];

function getTipoPaquete(transporte: string[]): string {
  const texto = transporte.join(" ").toLowerCase();
  if (texto.includes("bus")) return "Paquete en bus";
  if (
    texto.includes("avión") ||
    texto.includes("avion") ||
    texto.includes("aéreo") ||
    texto.includes("aereo")
  ) {
    return "Paquete con vuelo";
  }
  return "Paquete grupal";
}

export function PoliticaCancelacion({ salida }: { salida: Salida }) {
  const [abierta, setAbierta] = useState(false);
  const [condicionesAbiertas, setCondicionesAbiertas] = useState(false);
  const tipoPaquete = getTipoPaquete(salida.transporte);

  return (
    <section>
      <div className="glass rounded-2xl overflow-hidden shadow-card border border-sky-100">
        <button
          type="button"
          onClick={() => setAbierta((v) => !v)}
          className="w-full flex items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-sky-50 to-white border-b border-sky-100 text-left hover:bg-sky-50/50 transition-colors"
          aria-expanded={abierta}
        >
          <h2 className="text-xl font-bold text-travel-ink flex items-center gap-2">
            <span aria-hidden>📋</span>
            Política de cancelación
          </h2>
          <span
            className="text-euforia-sky-dark text-sm font-semibold shrink-0"
            aria-hidden
          >
            {abierta ? "▲" : "▼"}
          </span>
        </button>

        {abierta && (
          <div className="p-6 md:p-8 space-y-6 animate-fade-in">
            <p className="text-sm font-semibold text-euforia-sky-dark flex items-center gap-2">
              <span aria-hidden>🚌</span>
              {tipoPaquete} — penalidades por cancelación
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {PENALIDADES.map((item) => (
                <div
                  key={item.plazo}
                  className={`rounded-xl border p-4 ${NIVEL_STYLES[item.nivel]}`}
                >
                  <div className="flex gap-3">
                    <span
                      className="text-lg shrink-0 leading-none mt-0.5"
                      aria-hidden
                    >
                      ⚠️
                    </span>
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-travel-ink text-sm leading-snug">
                        {item.plazo}
                      </p>
                      <p className="text-sm text-travel-ink-muted leading-relaxed">
                        {item.detalle}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-sky-100 pt-5">
              <button
                type="button"
                onClick={() => setCondicionesAbiertas((v) => !v)}
                className="text-sm font-semibold text-euforia-sky-dark hover:text-euforia-sky transition-colors"
                aria-expanded={condicionesAbiertas}
              >
                {condicionesAbiertas
                  ? "▲ Ocultar condiciones generales"
                  : "▼ Ver condiciones generales completas"}
              </button>

              {condicionesAbiertas && (
                <dl className="mt-4 space-y-4">
                  {CONDICIONES.map((c) => (
                    <div key={c.titulo} className="space-y-1">
                      <dt className="text-sm font-bold text-travel-ink">
                        {c.titulo}
                      </dt>
                      <dd className="text-sm text-travel-ink-muted leading-relaxed">
                        {c.texto}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
