import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCatalog, fetchSalidaBySlug } from "@/lib/woocommerce";
import { getSimilaresSalidas } from "@/lib/similar-salidas";
import { SalidaDetailView } from "@/components/SalidaDetailView";
export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const salida = await fetchSalidaBySlug(slug);
  if (!salida) return { title: "Salida no encontrada" };
  return {
    title: salida.titulo,
    description: salida.descripcion ?? `Salida ${salida.titulo} - Euforia Viajes`,
    openGraph: {
      images: salida.imagenes[0] ? [{ url: salida.imagenes[0] }] : [],
    },
  };
}

export default async function SalidaPage({ params }: Props) {
  const { slug } = await params;
  const catalog = await fetchCatalog();
  const salida = catalog.salidas.find((s) => s.slug === slug) ?? null;

  if (!salida) {
    notFound();
  }

  const similares = getSimilaresSalidas(salida, catalog.salidas, 3);

  return (    <div>
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base font-semibold text-euforia-sky-dark hover:text-travel-ink transition-colors"
        >
          ← Volver al catálogo
        </Link>
      </div>
      <SalidaDetailView salida={salida} similares={similares} />
    </div>
  );
}
