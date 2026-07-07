import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchCatalog } from "@/lib/woocommerce";
import { StoreCatalogView } from "@/components/StoreCatalogView";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tienda — Salidas y paquetes",
  description:
    "Explorá todas las salidas grupales de Euforia Viajes. Filtrá por destino, categoría y precio.",
};

export default async function StorePage() {
  const catalog = await fetchCatalog();
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <StoreCatalogView initial={catalog} />
    </Suspense>
  );
}
