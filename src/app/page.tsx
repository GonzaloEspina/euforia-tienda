import { fetchCatalog } from "@/lib/woocommerce";
import { CatalogView } from "@/components/CatalogView";

export const revalidate = 300;

export default async function HomePage() {
  const catalog = await fetchCatalog();
  return <CatalogView initial={catalog} />;
}
