import type { Metadata } from "next";
import { fetchCatalog } from "@/lib/woocommerce";
import { HomeMarketingView } from "@/components/HomeMarketingView";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Euforia Viajes — Salidas grupales, financiación en cuotas y asesoramiento personalizado para tu próximo viaje.",
};

export default async function MarketingHomePage() {
  const catalog = await fetchCatalog();
  return <HomeMarketingView initial={catalog} />;
}
