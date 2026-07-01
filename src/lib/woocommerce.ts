import { unstable_cache } from "next/cache";
import type {
  CatalogData,
  MedioItem,
  Salida,
  WooCategory,
} from "@/types/salida";
import { WOO_CHECKOUT_PATH } from "@/lib/config";
import { DEFAULT_SALIDA_IMAGE } from "@/lib/salida-media";

const WOO_URL =
  process.env.NEXT_PUBLIC_WOO_URL ?? "https://viajaconeuforia.com";

const PARENT_CATEGORY_SLUGS = new Set([
  "nacionales",
  "internacionales",
  "salidas-grupales",
  "receptivo-chubut",
  "experiencias-chubut",
  "2-x-1",
]);

const SKIP_PARENT_NAMES = new Set(["sin categorizar", "sin categoría"]);

export function getWooBaseUrl(): string {
  return WOO_URL.replace(/\/$/, "");
}

function authHeader(): string | undefined {
  const key = process.env.WOO_CONSUMER_KEY;
  const secret = process.env.WOO_CONSUMER_SECRET;
  if (!key || !secret) return undefined;
  return `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
}

async function wooFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const auth = authHeader();
  const response = await fetch(`${getWooBaseUrl()}${path}`, {
    ...init,
    next: { revalidate: 300 },
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`WooCommerce ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function storeFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${getWooBaseUrl()}${path}`, {
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    throw new Error(`Store API ${path}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function fetchAllStorePages<T>(basePath: string): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const separator = basePath.includes("?") ? "&" : "?";
    const batch = await storeFetch<T[]>(
      `${basePath}${separator}per_page=${perPage}&page=${page}`
    );
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }

  return all;
}

interface StoreProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    currency_code: string;
  };
  images: { src: string; alt?: string; name?: string }[];
  categories: { id: number; name: string; slug: string }[];
  tags: { id: number; name: string; slug: string }[];
  attributes: {
    name: string;
    terms: { name: string }[];
  }[];
  stock_availability?: { text: string; class: string };
  is_purchasable: boolean;
  is_in_stock: boolean;
  add_to_cart?: { maximum?: number };
}

interface V3ProductMeta {
  id: number;
  featured: boolean;
  meta_data: { key: string; value: string }[];
  stock_quantity: number | null;
}

function minorToMajor(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return undefined;
  return num / 100;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function attrTerms(
  product: StoreProduct,
  name: string
): string[] {
  const attr = product.attributes.find(
    (a) => a.name.toLowerCase() === name.toLowerCase()
  );
  return attr?.terms.map((t) => t.name).filter(Boolean) ?? [];
}

function firstAttr(product: StoreProduct, name: string): string | undefined {
  const terms = attrTerms(product, name);
  return terms[0];
}

function parseMetaNumber(meta: { key: string; value: string }[], key: string) {
  const item = meta.find((m) => m.key === key);
  if (!item?.value) return undefined;
  const num = Number(item.value);
  return Number.isFinite(num) && num > 0 ? num : undefined;
}

/** Parsea montos tipo "U$S 6.349", "6349", "1.234.567". */
function parseMoneyString(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;

  let cleaned = value.replace(/[^\d.,]/g, "").trim();
  if (!cleaned) return undefined;

  if (cleaned.includes(",")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    const dots = (cleaned.match(/\./g) || []).length;
    if (dots > 1) {
      cleaned = cleaned.replace(/\./g, "");
    } else if (dots === 1) {
      const [, decimals] = cleaned.split(".");
      if (decimals?.length === 3) {
        cleaned = cleaned.replace(".", "");
      }
    }
  }

  const num = Number(cleaned);
  return Number.isFinite(num) && num > 0 ? num : undefined;
}

function metaMoney(
  meta: { key: string; value: string }[],
  key: string
): number | undefined {
  const item = meta.find((m) => m.key === key);
  return parseMetaNumber(meta, key) ?? parseMoneyString(item?.value);
}

function parseUsdPrices(
  product: StoreProduct,
  meta: { key: string; value: string }[],
  enPromocionMeta: string | undefined
) {
  let precioListaUsd =
    metaMoney(meta, "_precio_lista_usd") ??
    parseMoneyString(firstAttr(product, "Precio Lista USD")) ??
    parseMoneyString(firstAttr(product, "Precio USD"));

  let promoEfectivoUsd =
    metaMoney(meta, "_promo_efectivo_usd") ??
    parseMoneyString(firstAttr(product, "Promo Efectivo USD"));

  const enPromocionUsd = enPromocionMeta === "yes";

  if (!precioListaUsd && promoEfectivoUsd && !enPromocionUsd) {
    precioListaUsd = promoEfectivoUsd;
    promoEfectivoUsd = undefined;
  }

  if (enPromocionUsd && promoEfectivoUsd && !precioListaUsd) {
    precioListaUsd = promoEfectivoUsd;
  }

  return { precioListaUsd, promoEfectivoUsd: enPromocionUsd ? promoEfectivoUsd : undefined };
}

function isEstadoAgotado(estado?: string): boolean {
  return (estado ?? "").toLowerCase().includes("agotad");
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

function buildMedios(
  images: StoreProduct["images"],
  metaVideos: string[] = []
): MedioItem[] {
  const medios: MedioItem[] = images.map((img, i) => ({
    url: img.src,
    tipo: "imagen" as const,
    alt: img.alt || img.name,
    principal: i === 0,
  }));

  for (const url of metaVideos) {
    if (url && isVideoUrl(url)) {
      medios.push({ url, tipo: "video" });
    }
  }

  if (!medios.some((m) => m.tipo === "imagen")) {
    medios.unshift({
      url: DEFAULT_SALIDA_IMAGE,
      tipo: "imagen",
      alt: "Euforia Viajes",
      principal: true,
    });
  }

  return medios;
}

function resolveCategories(
  productCategories: StoreProduct["categories"],
  allCategories: WooCategory[]
): { categoria?: string; subcategorias: string[] } {
  const byId = new Map(allCategories.map((c) => [c.id, c]));
  const subs: string[] = [];
  let parentName: string | undefined;

  for (const cat of productCategories) {
    const full = byId.get(cat.id);
    if (!full) continue;

    if (full.parent === 0) {
      if (!SKIP_PARENT_NAMES.has(full.name.toLowerCase())) {
        parentName = full.name;
      }
    } else {
      const parent = byId.get(full.parent);
      if (parent && !SKIP_PARENT_NAMES.has(parent.name.toLowerCase())) {
        parentName = parentName ?? parent.name;
      }
      subs.push(full.name);
    }
  }

  if (!parentName) {
    const known = productCategories.find((c) =>
      PARENT_CATEGORY_SLUGS.has(c.slug)
    );
    parentName = known?.name;
  }

  return { categoria: parentName, subcategorias: subs };
}

function mapStoreProduct(
  product: StoreProduct,
  allCategories: WooCategory[],
  v3?: V3ProductMeta
): Salida {
  const meta = v3?.meta_data ?? [];
  const { categoria, subcategorias } = resolveCategories(
    product.categories,
    allCategories
  );

  const precioListaArs = minorToMajor(product.prices.regular_price);
  const promoEfectivoArs = product.on_sale
    ? minorToMajor(product.prices.sale_price)
    : parseMetaNumber(meta, "_promo_efectivo_ars") ??
      (meta.find((m) => m.key === "_en_promocion")?.value === "yes"
        ? minorToMajor(product.prices.sale_price)
        : undefined);

  const enPromocionMeta = meta.find((m) => m.key === "_en_promocion")?.value;
  const { precioListaUsd, promoEfectivoUsd } = parseUsdPrices(
    product,
    meta,
    enPromocionMeta
  );
  const enPromocion =
    enPromocionMeta === "yes" ||
    (product.on_sale && Boolean(promoEfectivoArs)) ||
    Boolean(promoEfectivoUsd && enPromocionMeta === "yes");

  const fecha =
    firstAttr(product, "Fecha de salida") ??
    meta.find((m) => m.key === "_fecha_salida")?.value;

  const itinerarioUrl = meta.find((m) => m.key === "_itinerario_url")?.value;
  const estado =
    firstAttr(product, "Estado") ??
    meta.find((m) => m.key === "_estado_salida")?.value;

  const metaVideosRaw = meta.find((m) => m.key === "_medios_videos")?.value;
  const metaVideos = metaVideosRaw
    ? metaVideosRaw.split(",").map((v) => v.trim()).filter(Boolean)
    : [];

  const descripcion = stripHtml(product.short_description || product.description);
  const medios = buildMedios(product.images, metaVideos);

  const cuposFromStock =
    v3?.stock_quantity ??
  (product.add_to_cart?.maximum && product.add_to_cart.maximum < 9999
      ? product.add_to_cart.maximum
      : undefined);

  const cuposMatch = product.stock_availability?.text?.match(/(\d+)/);
  const cupos =
    cuposFromStock ??
    (cuposMatch ? Number(cuposMatch[1]) : undefined);

  const maxCuotas =
    parseMetaNumber(meta, "_max_cuotas") ??
    parseMetaNumber(meta, "_cuotas_max") ??
    12;

  const porcentajeSena =
    parseMetaNumber(meta, "_porcentaje_sena") ??
    parseMetaNumber(meta, "_sena_porcentaje") ??
    15;

  const searchText = [
    product.name,
    descripcion,
    categoria,
    ...subcategorias,
    ...product.tags.map((t) => t.name),
    firstAttr(product, "Destino"),
    firstAttr(product, "País"),
    firstAttr(product, "Origen"),
    ...attrTerms(product, "Transporte"),
    ...attrTerms(product, "Servicio"),
    estado,
    fecha,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    id: product.id,
    slug: product.slug,
    titulo: product.name,
    descripcion: descripcion || undefined,
    fecha,
    categoria,
    subcategorias,
    etiquetas: product.tags.map((t) => t.name),
    destacado: v3?.featured ?? false,
    enPromocion,
    cupos: cupos && cupos > 0 ? cupos : undefined,
    destino: firstAttr(product, "Destino"),
    pais: firstAttr(product, "País"),
    origen: firstAttr(product, "Origen"),
    transporte: attrTerms(product, "Transporte"),
    servicio: attrTerms(product, "Servicio"),
    noches: firstAttr(product, "Noches"),
    precioListaArs,
    promoEfectivoArs: enPromocion ? promoEfectivoArs : undefined,
    precioListaUsd,
    promoEfectivoUsd: enPromocion ? promoEfectivoUsd : undefined,
    maxCuotas,
    porcentajeSena,
    itinerarioUrl: itinerarioUrl || undefined,
    estado,
    medios,
    imagenes: medios.filter((m) => m.tipo === "imagen").map((m) => m.url),
    videos: medios.filter((m) => m.tipo === "video").map((m) => m.url),
    permalink: product.permalink,
    isPurchasable: product.is_purchasable,
    isInStock: product.is_in_stock,
    stockText: product.stock_availability?.text,
    searchText,
  };
}

async function fetchV3MetaMap(): Promise<Map<number, V3ProductMeta>> {
  const map = new Map<number, V3ProductMeta>();
  if (!authHeader()) return map;

  let page = 1;
  while (true) {
    const batch = await wooFetch<
      {
        id: number;
        featured: boolean;
        meta_data: { key: string; value: string }[];
        stock_quantity: number | null;
      }[]
    >(
      `/wp-json/wc/v3/products?per_page=100&page=${page}&status=publish&_fields=id,featured,meta_data,stock_quantity`
    );
    if (!batch.length) break;
    for (const p of batch) {
      map.set(p.id, p);
    }
    if (batch.length < 100) break;
    page += 1;
  }

  return map;
}

function collectTags(products: Salida[]) {
  const tagSet = new Map<string, { id: number; name: string; slug: string }>();
  let id = 1;
  for (const p of products) {
    for (const name of p.etiquetas) {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      if (!tagSet.has(slug)) {
        tagSet.set(slug, { id: id++, name, slug });
      }
    }
  }
  return [...tagSet.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function computeCatalogVersion(salidas: Salida[]): string {
  const payload = salidas
    .map((s) => `${s.id}:${s.titulo}:${s.precioListaArs}:${s.estado}`)
    .join("|");
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }
  return `v${Math.abs(hash)}-${salidas.length}`;
}

async function fetchCatalogFromWoo(): Promise<CatalogData> {
  const [products, categories, v3Map] = await Promise.all([
    fetchAllStorePages<StoreProduct>("/wp-json/wc/store/v1/products"),
    fetchAllStorePages<WooCategory>(
      "/wp-json/wc/store/v1/products/categories"
    ),
    fetchV3MetaMap(),
  ]);

  const salidas = products
    .filter((p) => p.is_in_stock)
    .map((p) => mapStoreProduct(p, categories, v3Map.get(p.id)))
    .filter((s) => !isEstadoAgotado(s.estado))
  .sort((a, b) => {
      if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
      if (a.fecha && b.fecha) {
        const da = new Date(a.fecha.split("/").reverse().join("-"));
        const db = new Date(b.fecha.split("/").reverse().join("-"));
        if (!isNaN(da.getTime()) && !isNaN(db.getTime())) {
          return da.getTime() - db.getTime();
        }
      }
      return a.titulo.localeCompare(b.titulo);
    });

  return {
    salidas,
    categories: categories.filter(
      (c) => c.count > 0 && !SKIP_PARENT_NAMES.has(c.name.toLowerCase())
    ),
    tags: collectTags(salidas),
    version: computeCatalogVersion(salidas),
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchCatalog(): Promise<CatalogData> {
  return unstable_cache(fetchCatalogFromWoo, ["woocommerce-catalog"], {
    revalidate: 300,
    tags: ["catalog"],
  })();
}

export async function fetchSalidaBySlug(slug: string): Promise<Salida | null> {
  const catalog = await fetchCatalog();
  return catalog.salidas.find((s) => s.slug === slug) ?? null;
}

export async function proxyCartRequest(
  path: string,
  init: RequestInit,
  cookieHeader?: string
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (cookieHeader) headers.set("Cookie", cookieHeader);

  const response = await fetch(`${getWooBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  return response;
}

export const CHECKOUT_URL = `${getWooBaseUrl()}${WOO_CHECKOUT_PATH.replace(/\/$/, "")}`;
export const ACCOUNT_URL = `${getWooBaseUrl()}/mi-cuenta`;
