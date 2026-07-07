"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getStoreHref } from "@/lib/config";

type HomeHeroProps = {
  totalSalidas: number;
};

const WHATSAPP_URL =
  "https://wa.me/5492804321400?text=" +
  encodeURIComponent("Hola! Me gustaría más información sobre ");

export function HomeHero({ totalSalidas }: HomeHeroProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (query) {
      const params = new URLSearchParams({ q: query });
      router.push(getStoreHref(params));
      return;
    }
    router.push(getStoreHref());
  };

  return (
    <section className="relative overflow-hidden text-white min-h-[min(78vh,720px)] flex items-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(8, 47, 73, 0.45) 0%, rgba(8, 47, 73, 0.78) 100%), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80')",
        }}
      />
      <div className="relative w-full max-w-5xl mx-auto px-4 py-16 sm:py-20 text-center">
        <div className="mx-auto max-w-3xl space-y-6 flex flex-col items-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            ✓ Más de {totalSalidas} salidas disponibles
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-balance">
            ¿Cuál va a ser tu próximo viaje?
          </h1>

          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
            Más de {totalSalidas} salidas nacionales e internacionales · Financiación ·
            Coordinadores propios · Asistencia durante todo el viaje
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={getStoreHref()}
              className="inline-flex items-center justify-center rounded-full bg-euforia-sky px-6 py-3 font-bold text-white shadow-lg hover:bg-euforia-sky-light transition-colors"
            >
              Mirá todas las salidas
            </Link>
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
            className="flex w-full max-w-2xl flex-col sm:flex-row gap-2 rounded-2xl bg-white p-2 shadow-xl"
          >
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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

          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-sm sm:text-base font-semibold text-white/90">
            <span>{totalSalidas}+ paquetes</span>
            <span>11 años de experiencia</span>
            <span>+6000 pasajeros</span>
          </div>
        </div>
      </div>
    </section>
  );
}
