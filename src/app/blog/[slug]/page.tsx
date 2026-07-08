import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogPostCard } from "@/components/BlogExplorer";
import {
  fetchAllWpPosts,
  fetchWpPostBySlug,
  formatPostDate,
  getRelatedPosts,
} from "@/lib/wordpress-content";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await fetchAllWpPosts().catch(() => []);
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchWpPostBySlug(slug).catch(() => null);
  if (!post) return { title: "Artículo no encontrado" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [{ url: post.featuredImage.url }] : undefined,
    },
  };
}

export const revalidate = 300;

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    fetchWpPostBySlug(slug),
    fetchAllWpPosts().catch(() => []),
  ]);

  if (!post) notFound();

  const related = getRelatedPosts(allPosts, post, 3);

  return (
    <article>
      <header className="border-b border-sky-100 bg-gradient-to-b from-sky-50 to-travel-bg">
        <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
          <Link
            href="/blog"
            className="inline-flex text-sm font-semibold text-euforia-sky-dark hover:underline mb-6"
          >
            ← Volver al blog
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map((cat) => (
              <span
                key={cat.id}
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-euforia-sky-dark border border-sky-100"
              >
                {cat.name}
              </span>
            ))}
          </div>
          <time className="text-sm text-travel-ink-muted">{formatPostDate(post.date)}</time>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black text-travel-ink leading-tight">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 text-lg text-travel-ink-muted">{post.excerpt}</p>
          ) : null}
        </div>
        {post.featuredImage ? (
          <div className="max-w-5xl mx-auto px-4 pb-10">
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={post.featuredImage.url}
                alt={post.featuredImage.alt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          </div>
        ) : null}
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <div
          className="wp-content max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 pt-8 border-t border-sky-100">
          <Link
            href="/blog"
            className="inline-flex text-sm font-semibold text-euforia-sky-dark hover:underline"
          >
            ← Volver al blog
          </Link>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="border-t border-sky-100 bg-travel-bg-soft py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-travel-ink mb-8">Blogs relacionados</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((item) => (
                <BlogPostCard key={item.id} post={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
