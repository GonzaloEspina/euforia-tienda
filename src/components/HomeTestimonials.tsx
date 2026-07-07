"use client";

import { useEffect, useState } from "react";

const TESTIMONIALS = [
  {
    quote:
      "Un viaje increíble, todo muy bien organizado. Los coordinadores siempre atentos y los paisajes de Torres del Paine nos dejaron sin palabras.",
    author: "Roberto A.",
    trip: "Torres del Paine · Patagonia",
  },
  {
    quote:
      "Fuimos a Bariloche en invierno y la experiencia superó nuestras expectativas. Muy buena coordinación y excelente relación precio-calidad.",
    author: "Martín P.",
    trip: "Bariloche · Vacaciones de invierno",
  },
  {
    quote:
      "Cancún fue un sueño. Desde la reserva hasta el regreso, el equipo de Euforia estuvo presente. Ya estamos eligiendo el próximo destino.",
    author: "Laura M.",
    trip: "Cancún · México",
  },
  {
    quote:
      "Viajamos en bus a Mendoza y todo salió impecable. Hoteles, traslados y coordinadores de primera. Recomendamos Euforia sin dudar.",
    author: "Carolina S.",
    trip: "Mendoza y San Rafael",
  },
  {
    quote:
      "Mi primera salida internacional con Euforia y volví encantada. La atención personalizada marca la diferencia frente a otras agencias.",
    author: "Diego R.",
    trip: "Europa · Salida grupal",
  },
] as const;

export function HomeTestimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  const current = TESTIMONIALS[index];

  return (
    <section className="bg-travel-bg py-14 border-b border-sky-100/80">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
        <p className="text-euforia-sky-dark font-bold uppercase tracking-[0.2em] text-sm">
          Testimonios
        </p>
        <div className="flex items-center justify-center gap-1 text-amber-400 text-xl" aria-hidden>
          ★★★★★
        </div>
        <p className="text-travel-ink font-semibold">5.0 · +6000 viajeros felices</p>

        <blockquote className="glass rounded-2xl p-6 sm:p-8 text-left sm:text-center min-h-[180px]">
          <p className="text-lg text-travel-ink leading-relaxed">“{current.quote}”</p>
          <footer className="mt-4 text-travel-ink-muted font-medium">
            {current.author} — {current.trip}
          </footer>
        </blockquote>

        <div className="flex items-center justify-center gap-2">
          {TESTIMONIALS.map((item, i) => (
            <button
              key={item.author}
              type="button"
              aria-label={`Ver testimonio de ${item.author}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-8 bg-euforia-sky-dark" : "w-2.5 bg-sky-200 hover:bg-sky-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
