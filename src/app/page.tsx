import { Suspense } from "react";
import { fetchCatalog } from "@/lib/woocommerce";
import { CatalogView } from "@/components/CatalogView";

export const revalidate = 300;

export default async function HomePage() {
  const catalog = await fetchCatalog();
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <CatalogView initial={catalog} />
    </Suspense>
  );
}
