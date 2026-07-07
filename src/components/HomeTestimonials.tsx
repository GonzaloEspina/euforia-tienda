const TESTIMONIAL = {
  quote:
    "Un viaje increíble, todo muy bien organizado. Los coordinadores siempre atentos y los paisajes de Torres del Paine nos dejaron sin palabras. Totalmente recomendable.",
  author: "María G.",
  trip: "Torres del Paine · Salida grupal",
};

export function HomeTestimonials() {
  return (
    <section className="bg-travel-bg py-14">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <p className="text-euforia-sky-dark font-bold uppercase tracking-[0.2em] text-sm">
          Testimonios
        </p>
        <div className="flex items-center justify-center gap-1 text-amber-400 text-xl" aria-hidden>
          ★★★★★
        </div>
        <p className="text-travel-ink font-semibold">5.0 · +6000 viajeros felices</p>
        <blockquote className="glass rounded-2xl p-6 sm:p-8 text-left sm:text-center">
          <p className="text-lg text-travel-ink leading-relaxed">“{TESTIMONIAL.quote}”</p>
          <footer className="mt-4 text-travel-ink-muted font-medium">
            {TESTIMONIAL.author} — {TESTIMONIAL.trip}
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
