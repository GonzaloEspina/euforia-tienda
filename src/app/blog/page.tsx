import type { Metadata } from "next";
import { BlogExplorer } from "@/components/BlogExplorer";
import { PageHero } from "@/components/PageHero";
import { fetchAllWpPosts, fetchWpCategories } from "@/lib/wordpress-content";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Noticias, itinerarios y novedades de Euforia Viajes. Salidas grupales, destinos y tips para tu próximo viaje.",
};

export const revalidate = 300;

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    fetchAllWpPosts().catch(() => []),
    fetchWpCategories().catch(() => []),
  ]);

  return (
    <>
      <PageHero
        badge="Novedades"
        title="Blog Euforia Viajes"
        subtitle="Itinerarios, destinos y noticias de nuestra agencia. Encontrá inspiración para tu próximo viaje."
      />

      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <BlogExplorer posts={posts} categories={categories} />
      </section>
    </>
  );
}
