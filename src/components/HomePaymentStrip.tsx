const METHODS = [
  "CUOTAS CON TARJETA",
  "VISA",
  "Mastercard",
  "Naranja X",
  "Banco Nación",
  "Patagonia 365",
  "Mercado Pago",
  "Convenios empresariales",
] as const;

export function HomePaymentStrip() {
  return (
    <section className="bg-travel-bg-soft border-b border-sky-100">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-travel-ink-muted">
          <span className="font-bold text-travel-ink uppercase tracking-wide mr-1">
            Pagá con
          </span>
          {METHODS.map((method) => (
            <span
              key={method}
              className="rounded-full bg-white border border-sky-100 px-3 py-1 font-semibold text-travel-ink"
            >
              {method}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
