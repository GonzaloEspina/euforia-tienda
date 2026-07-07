const ITEMS = [
  "Legajo 16816",
  "11 años organizando viajes",
  "+6.000 pasajeros",
  "Atención personalizada",
  "Convenios con sindicatos",
] as const;

export function HomeTrustStrip() {
  return (
    <section className="bg-white border-y border-sky-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm sm:text-base text-travel-ink">
          {ITEMS.map((item) => (
            <li key={item} className="inline-flex items-center gap-2 font-medium">
              <span className="text-emerald-600" aria-hidden>
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
