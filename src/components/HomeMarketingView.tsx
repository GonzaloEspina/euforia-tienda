import type { CatalogData } from "@/types/salida";
import { HomeHero } from "./HomeHero";
import { HomeTrustStrip } from "./HomeTrustStrip";
import { HomePaymentStrip } from "./HomePaymentStrip";
import { HomeTestimonials } from "./HomeTestimonials";
import { HomeSection } from "./HomeSection";
import { HomeExploreDestinations } from "./HomeExploreDestinations";
import {
  HomeFeaturedPackages,
  HomeFeaturedPackagesAction,
} from "./HomeFeaturedPackages";
import { HomeWhyEuforia } from "./HomeWhyEuforia";
import { HomeStoreCta } from "./HomeStoreCta";
import { CotizacionBanner } from "./CotizacionBanner";

export function HomeMarketingView({ initial: catalog }: { initial: CatalogData }) {
  return (
    <>
      <HomeHero totalSalidas={catalog.salidas.length} />
      <HomeTrustStrip />
      <HomePaymentStrip />
      <HomeTestimonials />

      <HomeSection
        title="Explorá por destino"
        subtitle="Elegí un destino y te llevamos al catálogo con ese filtro aplicado"
        icon="🌐"
        variant="white"
      >
        <HomeExploreDestinations />
      </HomeSection>

      <HomeSection
        title="Paquetes destacados"
        subtitle="Las mejores promociones y salidas más elegidas por nuestros viajeros"
        icon="🔥"
        variant="soft"
        action={<HomeFeaturedPackagesAction />}
      >
        <HomeFeaturedPackages salidas={catalog.salidas} />
      </HomeSection>

      <HomeSection
        title="¿Por qué viajar con Euforia?"
        subtitle="Más de 11 años organizando viajes con atención personalizada"
        variant="white"
      >
        <HomeWhyEuforia />
      </HomeSection>

      <HomeStoreCta totalSalidas={catalog.salidas.length} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <CotizacionBanner />
      </div>
    </>
  );
}
