import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchSalidaBySlug } from "@/lib/woocommerce";
import { CotizacionWizard } from "@/components/CotizacionWizard";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const salida = await fetchSalidaBySlug(slug);
  if (!salida) return { title: "Salida no encontrada" };
  return {
    title: `Cotizar: ${salida.titulo}`,
    description: `Solicitá una cotización personalizada para ${salida.titulo}`,
  };
}

export default async function CotizarPage({ params }: Props) {
  const { slug } = await params;
  const salida = await fetchSalidaBySlug(slug);

  if (!salida) {
    notFound();
  }

  return <CotizacionWizard salida={salida} />;
}
