import Link from "next/link";

export function CotizacionBanner() {
  return (
    <section className="mt-10 rounded-2xl overflow-hidden border border-sky-200 bg-white shadow-card p-6 md:p-8">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-widest text-euforia-sky-dark font-semibold mb-2">
          Cotización a medida
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-balance mb-3 text-travel-ink">
          ¿No encontrás la salida que buscás?
        </h2>
        <p className="text-base md:text-lg text-travel-ink-muted mb-5 leading-relaxed">
          Elegí tu destino soñado y nosotros lo hacemos realidad. Un asesor te
          contactará por WhatsApp con opciones pensadas para vos.
        </p>
        <Link
          href="/cotizar/personalizada"
          className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-euforia-sky-dark hover:bg-euforia-sky text-white font-bold text-base transition-all shadow-sm"
        >
          Armar mi viaje a medida
        </Link>
      </div>
    </section>
  );
}
