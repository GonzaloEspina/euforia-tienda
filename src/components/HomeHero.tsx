"use client";

import { FormEvent } from "react";

type HomeHeroProps = {
  totalSalidas: number;
  search: string;
  onSearchChange: (value: string) => void;
};

const WHATSAPP_URL =
  "https://wa.me/5492804321400?text=" +
  encodeURIComponent("Hola! Me gustaría más información sobre ");

export function HomeHero({ totalSalidas, search, onSearchChange }: HomeHeroProps) {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    document.getElementById("salidas")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(8, 47, 73, 0.55) 0%, rgba(8, 47, 73, 0.82) 100%), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80')",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 py-14 sm:py-20">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            ✓ Más de {totalSalidas} salidas disponibles
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-balance">
            ¿Cuál va a ser tu próximo viaje?
          </h1>

          <p className="text-lg sm:text-xl text-white/90 max-w-2xl">
            Salidas nacionales e internacionales · Financiación · Coordinadores propios ·
            Asistencia durante todo el viaje
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#salidas"
              className="inline-flex items-center justify-center rounded-full bg-euforia-sky px-6 py-3 font-bold text-white shadow-lg hover:bg-euforia-sky-light transition-colors"
            >
              Buscar viajes
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-6 py-3 font-bold text-white shadow-lg hover:bg-[#20bd5a] transition-colors"
            >
              Hablar por WhatsApp
            </a>
          </div>

          <form
            onSubmit={onSubmit}
            className="flex flex-col sm:flex-row gap-2 rounded-2xl bg-white p-2 shadow-xl max-w-2xl"
          >
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="¿A dónde querés viajar?"
              className="flex-1 rounded-xl border-0 px-4 py-3 text-travel-ink placeholder:text-travel-ink-muted focus:outline-none focus:ring-2 focus:ring-euforia-sky/40"
            />
            <button
              type="submit"
              className="rounded-xl bg-euforia-sky-dark px-6 py-3 font-bold text-white hover:bg-euforia-sky transition-colors"
            >
              Buscar →
            </button>
          </form>

          <div className="flex flex-wrap gap-6 pt-2 text-sm sm:text-base font-semibold text-white/90">
            <span>{totalSalidas}+ paquetes</span>
            <span>11 años de experiencia</span>
            <span>+6000 pasajeros</span>
          </div>
        </div>
      </div>
    </section>
  );
}
