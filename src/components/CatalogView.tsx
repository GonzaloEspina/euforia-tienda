"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CatalogData } from "@/types/salida";
import {
  DEFAULT_CATALOG_SORT,
  sortSalidas,
  type CatalogSort,
} from "@/lib/catalog-sort";
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

export function CatalogView({ initial: catalog }: { initial: CatalogData }) {
  const { priceMode } = usePreferences();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [onlyDestacado, setOnlyDestacado] = useState(false);
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [sort, setSort] = useState<CatalogSort>(DEFAULT_CATALOG_SORT);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
      onSearchChange: setSearch,
      onCategoryChange: setCategory,
      onTagChange: setTag,
      onDestacadoChange: setOnlyDestacado,
      onPromoChange: setOnlyPromo,
    }),
    []
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
    setSearch("");
    setCategory(null);
    setTag(null);
    setOnlyDestacado(false);
    setOnlyPromo(false);
  }, []);

  const filtersProps = {
    salidas: catalog.salidas,
    categories: catalog.categories,
    tags: catalog.tags,
    search,
    onSearchChange: setSearch,
    selectedCategory: category,
    onCategoryChange: setCategory,
    selectedTag: tag,
    onTagChange: setTag,
    onlyDestacado,
    onDestacadoChange: setOnlyDestacado,
    onlyPromo,
    onPromoChange: setOnlyPromo,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <section className="mb-10 text-center md:text-left">
        <p className="text-euforia-sky-dark text-base font-semibold uppercase tracking-[0.2em] mb-2">
          Viajar es sentir
        </p>
        <h1 className="text-3xl md:text-5xl font-bold text-balance mb-3 text-travel-ink">
          Tu próximo destino{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-euforia-sky-dark to-euforia-sky">
            te está esperando
          </span>
        </h1>
        <p className="text-travel-ink-muted max-w-2xl text-lg">
          Explorá salidas grupales, viajes nacionales e internacionales.
          <br />
          Reservá con la confianza de Euforia Viajes.
        </p>
      </section>

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

      <CotizacionBanner />
    </div>
  );
}
