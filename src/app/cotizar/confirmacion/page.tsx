import Link from "next/link";

interface Props {
  searchParams: Promise<{ salida?: string; nombre?: string }>;
}

export default async function CotizacionConfirmacionPage({
  searchParams,
}: Props) {
  const { salida, nombre } = await searchParams;
  const saludo = nombre?.trim() ? `, ${nombre}` : "";

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center animate-fade-in">
      <p className="text-5xl mb-6">✅</p>
      <h1 className="text-3xl font-bold mb-3">¡Cotización enviada{saludo}!</h1>
      <p className="text-euforia-muted mb-8 leading-relaxed text-lg">
        Recibimos tu solicitud. Un asesor de Euforia Viajes va a revisar todos
        los datos que cargaste y te va a contactar por{" "}
        <strong>WhatsApp</strong> a la brevedad.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {salida && (
          <Link
            href={`/salida/${salida}`}
            className="px-6 py-3.5 rounded-xl border border-white/10 hover:border-euforia-sky/40 text-base font-medium"
          >
            Ver la salida
          </Link>
        )}
        <Link
          href="/"
          className="px-6 py-3.5 rounded-xl bg-euforia-sky text-euforia-darker font-bold text-base"
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  );
}
