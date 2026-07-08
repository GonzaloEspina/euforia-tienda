"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { WpCategory, WpPostSummary } from "@/lib/wordpress-content";
import { formatPostDate } from "@/lib/wordpress-content";

const PAGE_SIZE = 12;

type Props = {
  posts: WpPostSummary[];
  categories: WpCategory[];
};

export function BlogExplorer({ posts, categories }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    let result = posts.filter((post) => {
      const matchesQuery =
        !normalized ||
        post.title.toLowerCase().includes(normalized) ||
        post.excerpt.toLowerCase().includes(normalized);

      const matchesCategory =
        category === "all" ||
        post.categories.some((cat) => cat.slug === category || String(cat.id) === category);

      return matchesQuery && matchesCategory;
    });

    result = [...result].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sort === "newest" ? db - da : da - db;
    });

    return result;
  }, [posts, query, category, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-8">
      <div className="glass rounded-2xl p-4 sm:p-5">
        <div className="grid lg:grid-cols-[1fr_auto_auto] gap-3">
          <label className="block">
            <span className="sr-only">Buscar</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título o contenido..."
              className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm bg-white"
            />
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-sky-200 px-4 py-2.5 text-sm bg-white min-w-[180px]"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name} ({cat.count})
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
            className="rounded-xl border border-sky-200 px-4 py-2.5 text-sm bg-white min-w-[160px]"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
          </select>
        </div>
        <p className="mt-3 text-xs text-travel-ink-muted">
          {filtered.length} {filtered.length === 1 ? "publicación" : "publicaciones"}
          {query ? ` para “${query}”` : ""}
          {filtered.length > PAGE_SIZE
            ? ` · Página ${currentPage} de ${totalPages}`
            : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-sky-100 bg-white px-6 py-16 text-center">
          <p className="text-lg font-semibold text-travel-ink">No encontramos publicaciones</p>
          <p className="text-sm text-travel-ink-muted mt-2">
            Probá con otra búsqueda o categoría.
          </p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-xl border border-sky-200 text-sm font-semibold text-travel-ink hover:bg-sky-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (n) =>
                    n === 1 ||
                    n === totalPages ||
                    Math.abs(n - currentPage) <= 1
                )
                .map((n, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev != null && n - prev > 1;
                  return (
                    <span key={n} className="flex items-center gap-2">
                      {showEllipsis ? (
                        <span className="text-travel-ink-muted px-1">…</span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setPage(n)}
                        className={`min-w-[2.5rem] px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                          n === currentPage
                            ? "bg-euforia-sky-dark text-white"
                            : "border border-sky-200 text-travel-ink hover:bg-sky-50"
                        }`}
                      >
                        {n}
                      </button>
                    </span>
                  );
                })}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-xl border border-sky-200 text-sm font-semibold text-travel-ink hover:bg-sky-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export function BlogPostCard({ post }: { post: WpPostSummary }) {
  return (
    <article className="group flex flex-col rounded-2xl overflow-hidden border border-sky-100 bg-white shadow-sm hover:shadow-lg hover:border-euforia-sky/40 transition-all">
      <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] bg-sky-50">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gradient-to-br from-sky-100 to-sky-50">
            ✈️
          </div>
        )}
      </Link>
      <div className="flex flex-col flex-1 p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          {post.categories.slice(0, 2).map((cat) => (
            <span
              key={cat.id}
              className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-euforia-sky-dark"
            >
              {cat.name}
            </span>
          ))}
        </div>
        <time className="text-xs text-travel-ink-muted">{formatPostDate(post.date)}</time>
        <h2 className="mt-1 text-lg font-bold text-travel-ink line-clamp-2 group-hover:text-euforia-sky-dark transition-colors">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="mt-2 text-sm text-travel-ink-muted line-clamp-3 flex-1">{post.excerpt}</p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-flex text-sm font-semibold text-euforia-sky-dark hover:underline"
        >
          Leer más →
        </Link>
      </div>
    </article>
  );
}
