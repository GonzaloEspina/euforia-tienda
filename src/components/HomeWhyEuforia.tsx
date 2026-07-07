const REASONS = [
  {
    icon: "🛡️",
    title: "Viaje asegurado",
    text: "Respaldo y atención en todo momento",
  },
  {
    icon: "💳",
    title: "Cuotas sin interés",
    text: "Financiación accesible para todos",
  },
  {
    icon: "🎯",
    title: "Todo incluido",
    text: "Sin sorpresas, precio final garantizado",
  },
  {
    icon: "🤝",
    title: "Asesoramiento",
    text: "Te acompañamos desde la consulta hasta el regreso",
  },
] as const;

export function HomeWhyEuforia() {
  return (
    <div className="rounded-3xl border border-sky-100 bg-white p-6 sm:p-8 shadow-sm">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {REASONS.map((item) => (
          <article key={item.title} className="text-center space-y-2">
            <div className="text-3xl" aria-hidden>
              {item.icon}
            </div>
            <h3 className="font-bold text-travel-ink">{item.title}</h3>
            <p className="text-sm text-travel-ink-muted leading-relaxed">{item.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
