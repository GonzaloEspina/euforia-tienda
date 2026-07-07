import Link from "next/link";
import { getStoreHref } from "@/lib/config";

type Props = {
  totalSalidas: number;
};

export function HomeStoreCta({ totalSalidas }: Props) {
  return (
    <section className="bg-gradient-to-b from-travel-bg to-travel-bg-soft border-b border-sky-100/80 py-14 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 text-center space-y-5">
        <p className="text-euforia-sky-dark font-bold uppercase tracking-[0.18em] text-sm">
          Catálogo completo
        </p>
        <h2 className="text-2xl sm:text-4xl font-bold text-travel-ink text-balance">
          Mirá todas nuestras salidas
        </h2>
        <p className="text-travel-ink-muted text-base sm:text-lg leading-relaxed">
          Más de {totalSalidas} paquetes con salidas programadas. Filtrá por destino,
          categoría, fecha y precio en la tienda.
        </p>
        <Link
          href={getStoreHref()}
          className="inline-flex items-center justify-center rounded-full bg-euforia-sky-dark px-8 py-4 text-base sm:text-lg font-bold text-white shadow-lg hover:bg-euforia-sky transition-colors"
        >
          Ir a la tienda →
        </Link>
      </div>
    </section>
  );
}
