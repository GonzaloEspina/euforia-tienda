const WP_BASE =
  process.env.NEXT_PUBLIC_WOO_URL?.replace(/\/$/, "") ??
  "https://viajaconeuforia.com";

export type WpCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

export type WpPostSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  link: string;
  featuredImage?: { url: string; alt: string };
  categories: WpCategory[];
};

export type WpPostDetail = WpPostSummary & {
  content: string;
};

type WpApiPost = {
  id: number;
  slug: string;
  date: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content?: { rendered: string };
  categories?: number[];
  jetpack_featured_media_url?: string;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url?: string;
      alt_text?: string;
      media_details?: { sizes?: { medium?: { source_url?: string } } };
    }>;
    "wp:term"?: Array<
      Array<{
        id: number;
        name: string;
        slug: string;
        taxonomy: string;
      }>
    >;
  };
};

function decodeHtml(text: string): string {
  return text
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

export function stripHtml(html: string): string {
  return decodeHtml(
    html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function mapFeaturedImage(post: WpApiPost): WpPostSummary["featuredImage"] {
  const embedded = post._embedded?.["wp:featuredmedia"]?.[0];
  const url =
    embedded?.media_details?.sizes?.medium?.source_url ??
    embedded?.source_url ??
    post.jetpack_featured_media_url;

  if (!url) return undefined;

  return {
    url,
    alt: embedded?.alt_text?.trim() || stripHtml(post.title.rendered),
  };
}

function mapCategories(post: WpApiPost, categoryMap?: Map<number, WpCategory>): WpCategory[] {
  const embedded = post._embedded?.["wp:term"]?.flat() ?? [];
  if (embedded.length > 0) {
    return embedded
      .filter((term) => term.taxonomy === "category")
      .map((term) => ({
        id: term.id,
        name: decodeHtml(term.name),
        slug: term.slug,
        count: 0,
      }));
  }

  if (!categoryMap || !post.categories?.length) return [];

  return post.categories
    .map((id) => categoryMap.get(id))
    .filter((cat): cat is WpCategory => Boolean(cat));
}

function mapPostSummary(post: WpApiPost, categoryMap?: Map<number, WpCategory>): WpPostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: stripHtml(post.title.rendered),
    excerpt: stripHtml(post.excerpt.rendered),
    date: post.date,
    link: post.link,
    featuredImage: mapFeaturedImage(post),
    categories: mapCategories(post, categoryMap),
  };
}

function mapPostDetail(post: WpApiPost, categoryMap?: Map<number, WpCategory>): WpPostDetail {
  return {
    ...mapPostSummary(post, categoryMap),
    content: post.content?.rendered ?? "",
  };
}

async function wpFetch<T>(path: string, revalidate = 300): Promise<T> {
  const res = await fetch(`${WP_BASE}${path}`, {
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`WordPress ${path} (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export async function fetchWpCategories(): Promise<WpCategory[]> {
  const data = await wpFetch<
    Array<{ id: number; name: string; slug: string; count: number }>
  >("/wp-json/wp/v2/categories?per_page=100&hide_empty=true");

  return data.map((cat) => ({
    id: cat.id,
    name: decodeHtml(cat.name),
    slug: cat.slug,
    count: cat.count,
  }));
}

export async function fetchAllWpPosts(): Promise<WpPostSummary[]> {
  const categories = await fetchWpCategories().catch(() => []);
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));
  const all: WpPostSummary[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `${WP_BASE}/wp-json/wp/v2/posts?per_page=100&page=${page}&status=publish&_fields=id,slug,date,link,title,excerpt,categories,jetpack_featured_media_url`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) break;

    const data = (await res.json()) as WpApiPost[];
    if (!Array.isArray(data) || data.length === 0) break;

    all.push(...data.map((post) => mapPostSummary(post, categoryMap)));

    const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? 1);
    if (page >= totalPages) break;
    page += 1;
  }

  return all;
}

export async function fetchWpPostBySlug(slug: string): Promise<WpPostDetail | null> {
  const [data, categories] = await Promise.all([
    wpFetch<WpApiPost[]>(
      `/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed`
    ),
    fetchWpCategories().catch(() => []),
  ]);

  const post = data[0];
  if (!post) return null;

  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));
  return mapPostDetail(post, categoryMap);
}

export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
