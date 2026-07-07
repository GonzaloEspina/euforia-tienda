"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CatalogData } from "@/types/salida";
import {
  DEFAULT_CATALOG_SORT,
  sortSalidas,
  type CatalogSort,
} from "@/lib/catalog-sort";
import {
  buildCatalogUrlFilters,
  readCatalogUrlFilters,
  type CatalogUrlFilters,
} from "@/lib/home-catalog";
import { usePreferences } from "@/context/PreferencesContext";
import { SalidaCard } from "./SalidaCard";
import {
  CatalogFilters,
  filterSalidas,
  buildActiveFilters,
  PAGE_SIZE,
} from "./CatalogFilters";
import { PriceModeToggle } from "./PriceModeToggle";
import { ActiveFiltersBar } from "./ActiveFiltersBar";
import { CotizacionBanner } from "./CotizacionBanner";
import { Pagination } from "./Pagination";

export function StoreCatalogView({ initial: catalog }: { initial: CatalogData }) {
  const { priceMode } = usePreferences();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const urlFilters = useMemo(
    () => readCatalogUrlFilters(searchParams, catalog.categories),
    [searchParams, catalog.categories]
  );

  const { search, categorySlug: category, onlyDestacado, onlyPromo } = urlFilters;
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<CatalogSort>(DEFAULT_CATALOG_SORT);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const replaceFilters = useCallback(
    (next: CatalogUrlFilters) => {
      const params = buildCatalogUrlFilters(next);
      const qs = params.toString();
      const hash =
        typeof window !== "undefined" && window.location.hash
          ? window.location.hash
          : "#salidas";
      const nextUrl = qs ? `${pathname}?${qs}${hash}` : `${pathname}${hash}`;
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router]
  );

  const patchFilters = useCallback(
    (patch: Partial<CatalogUrlFilters>) => {
      replaceFilters({ ...urlFilters, ...patch });
    },
    [replaceFilters, urlFilters]
  );

  useEffect(() => {
    setTag(null);
  }, [searchParams]);

  useEffect(() => {
    if (window.location.hash !== "#salidas") return;
    requestAnimationFrame(() => {
      document.getElementById("salidas")?.scrollIntoView({ behavior: "smooth" });
    });
  }, [searchParams]);

  const filterState = useMemo(
    () => ({
      search,
      categorySlug: category,
      tagSlug: tag,
      onlyDestacado,
      onlyPromo,
    }),
    [search, category, tag, onlyDestacado, onlyPromo]
  );

  useEffect(() => {
    setPage(1);
  }, [search, category, tag, onlyDestacado, onlyPromo, sort, priceMode]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page]);

  const filtered = useMemo(() => {
    const result = filterSalidas(catalog.salidas, {
      search,
      categorySlug: category,
      categories: catalog.categories,
      tagSlug: tag,
      onlyDestacado,
      onlyPromo,
    });
    return sortSalidas(result, sort, priceMode);
  }, [
    catalog,
    search,
    category,
    tag,
    onlyDestacado,
    onlyPromo,
    sort,
    priceMode,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const pageStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(safePage * PAGE_SIZE, filtered.length);

  const filterHandlers = useMemo(
    () => ({
      onSearchChange: (value: string) => patchFilters({ search: value }),
      onCategoryChange: (value: string | null) =>
        patchFilters({ categorySlug: value }),
      onTagChange: setTag,
      onDestacadoChange: (value: boolean) => patchFilters({ onlyDestacado: value }),
      onPromoChange: (value: boolean) => patchFilters({ onlyPromo: value }),
    }),
    [patchFilters]
  );

  const activeFilters = useMemo(
    () =>
      buildActiveFilters(
        filterState,
        catalog.categories,
        catalog.tags,
        filterHandlers
      ),
    [filterState, catalog.categories, catalog.tags, filterHandlers]
  );

  const clearAllFilters = useCallback(() => {
    setTag(null);
    replaceFilters({
      search: "",
      categorySlug: null,
      onlyDestacado: false,
      onlyPromo: false,
    });
  }, [replaceFilters]);

  const filtersProps = {
    salidas: catalog.salidas,
    categories: catalog.categories,
    tags: catalog.tags,
    search,
    onSearchChange: filterHandlers.onSearchChange,
    selectedCategory: category,
    onCategoryChange: filterHandlers.onCategoryChange,
    selectedTag: tag,
    onTagChange: setTag,
    onlyDestacado,
    onDestacadoChange: filterHandlers.onDestacadoChange,
    onlyPromo,
    onPromoChange: filterHandlers.onPromoChange,
  };

  return (
    <>
      <div id="salidas" className="bg-travel-bg-soft border-b border-sky-100/80 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-travel-ink">
              <span className="mr-2">📁</span>
              Todos los paquetes
            </h1>
            <p className="text-travel-ink-muted mt-2">
              {filtered.length} paquetes encontrados · Elegí tu próximo destino
            </p>
          </div>

          <div className="lg:grid lg:grid-cols-[280px_1fr] gap-8">
            <div className="hidden lg:block space-y-5">
              <CatalogFilters {...filtersProps} />
              <PriceModeToggle />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4 lg:hidden">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl glass text-base font-medium"
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                >
                  {mobileFiltersOpen ? "Ocultar filtros" : "Filtros y búsqueda"}
                </button>
                <div className="sm:hidden">
                  <PriceModeToggle compact />
                </div>
              </div>

              {mobileFiltersOpen && (
                <div className="lg:hidden mb-6 space-y-5 glass rounded-2xl p-4">
                  <CatalogFilters {...filtersProps} />
                  <PriceModeToggle />
                </div>
              )}

              <ActiveFiltersBar
                filters={activeFilters}
                onClearAll={clearAllFilters}
                totalCount={filtered.length}
                pageStart={pageStart}
                pageEnd={pageEnd}
                sort={sort}
                onSortChange={setSort}
              />

              {filtered.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <p className="text-4xl mb-4">🧭</p>
                  <p className="font-semibold mb-2 text-travel-ink">No encontramos salidas</p>
                  <p className="text-base text-travel-ink-muted mb-4">
                    Probá con otros filtros o términos de búsqueda.
                  </p>
                  {activeFilters.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-base text-euforia-sky-dark hover:underline"
                    >
                      Borrar todos los filtros
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {paginated.map((salida) => (
                      <SalidaCard key={salida.id} salida={salida} />
                    ))}
                  </div>
                  <Pagination
                    page={safePage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <CotizacionBanner />
      </div>
    </>
  );
}
