"use client";

import { useMemo } from "react";
import type { Salida, WooCategory } from "@/types/salida";
import { normalizeSearch } from "@/lib/format";
import { TagPicker } from "./TagPicker";
import type { ActiveFilter } from "./ActiveFiltersBar";

export const PAGE_SIZE = 12;

export interface CatalogFilterState {
  search: string;
  categorySlug: string | null;
  tagSlug: string | null;
  onlyDestacado: boolean;
  onlyPromo: boolean;
}

interface FiltersProps {
  salidas: Salida[];
  categories: WooCategory[];
  tags: { name: string; slug: string }[];
  search: string;
  onSearchChange: (v: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (v: string | null) => void;
  selectedTag: string | null;
  onTagChange: (v: string | null) => void;
  onlyDestacado: boolean;
  onDestacadoChange: (v: boolean) => void;
  onlyPromo: boolean;
  onPromoChange: (v: boolean) => void;
}

export function CatalogFilters({
  salidas,
  categories,
  tags,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTag,
  onTagChange,
  onlyDestacado,
  onDestacadoChange,
  onlyPromo,
  onPromoChange,
}: FiltersProps) {
  const parentCategories = useMemo(() => {
    const parents = categories.filter((c) => c.parent === 0);
    const withSalidas = parents.filter((c) =>
      salidas.some(
        (s) =>
          s.categoria?.toLowerCase() === c.name.toLowerCase() ||
          s.subcategorias.some(
            (sub) => sub.toLowerCase() === c.name.toLowerCase()
          )
      )
    );
    return withSalidas.sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, salidas]);

  const usedTags = useMemo(() => {
    const used = new Set(salidas.flatMap((s) => s.etiquetas.map((t) => t.toLowerCase())));
    return tags.filter((t) => used.has(t.name.toLowerCase()));
  }, [tags, salidas]);

  return (
    <aside className="space-y-5">
      <div>
        <label htmlFor="search" className="sr-only">
          Buscar salidas
        </label>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-travel-ink-muted" />
          <input
            id="search"
            type="search"
            placeholder="Buscar por título, destino, descripción..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white border border-sky-200 focus:border-euforia-sky focus:outline-none focus:ring-2 focus:ring-euforia-sky/20 text-base text-travel-ink placeholder:text-travel-ink-muted"
          />
        </div>
      </div>

      <FilterSection title="Categorías">
        <FilterChip
          active={!selectedCategory}
          onClick={() => onCategoryChange(null)}
        >
          Todas
        </FilterChip>
        {parentCategories.map((cat) => (
          <FilterChip
            key={cat.id}
            active={selectedCategory === cat.slug}
            onClick={() =>
              onCategoryChange(
                selectedCategory === cat.slug ? null : cat.slug
              )
            }
          >
            {cat.name}
            <span className="ml-1 opacity-60">({cat.count})</span>
          </FilterChip>
        ))}
      </FilterSection>

      {usedTags.length > 0 && (
        <TagPicker
          tags={usedTags}
          selectedSlug={selectedTag}
          onChange={onTagChange}
        />
      )}

      <FilterSection title="Filtros rápidos">
        <FilterChip
          active={onlyDestacado}
          onClick={() => onDestacadoChange(!onlyDestacado)}
        >
          ⭐ Solo destacados
        </FilterChip>
        <FilterChip active={onlyPromo} onClick={() => onPromoChange(!onlyPromo)}>
          🏷️ En promoción
        </FilterChip>
      </FilterSection>
    </aside>
  );
}

export function filterSalidas(
  salidas: Salida[],
  opts: {
    search: string;
    categorySlug: string | null;
    categories: WooCategory[];
    tagSlug: string | null;
    onlyDestacado: boolean;
    onlyPromo: boolean;
  }
): Salida[] {
  let result = salidas;

  if (opts.search.trim()) {
    const q = normalizeSearch(opts.search);
    result = result.filter((s) => normalizeSearch(s.searchText).includes(q));
  }

  if (opts.categorySlug) {
    const cat = opts.categories.find((c) => c.slug === opts.categorySlug);
    if (cat) {
      const name = cat.name.toLowerCase();
      result = result.filter(
        (s) =>
          s.categoria?.toLowerCase() === name ||
          s.subcategorias.some((sub) => sub.toLowerCase() === name)
      );
    }
  }

  if (opts.tagSlug) {
    result = result.filter((s) =>
      s.etiquetas.some(
        (t) => t.toLowerCase().replace(/\s+/g, "-") === opts.tagSlug
      )
    );
  }

  if (opts.onlyDestacado) {
    result = result.filter((s) => s.destacado);
  }

  if (opts.onlyPromo) {
    result = result.filter((s) => s.enPromocion);
  }

  return result;
}

export function buildActiveFilters(
  state: CatalogFilterState,
  categories: WooCategory[],
  tags: { name: string; slug: string }[],
  handlers: {
    onSearchChange: (v: string) => void;
    onCategoryChange: (v: string | null) => void;
    onTagChange: (v: string | null) => void;
    onDestacadoChange: (v: boolean) => void;
    onPromoChange: (v: boolean) => void;
  }
): ActiveFilter[] {
  const active: ActiveFilter[] = [];

  if (state.search.trim()) {
    const q = state.search.trim();
    active.push({
      id: "search",
      label: `Búsqueda: “${q.length > 28 ? `${q.slice(0, 28)}…` : q}”`,
      onRemove: () => handlers.onSearchChange(""),
    });
  }

  if (state.categorySlug) {
    const cat = categories.find((c) => c.slug === state.categorySlug);
    active.push({
      id: "category",
      label: cat ? `Categoría: ${cat.name}` : "Categoría",
      onRemove: () => handlers.onCategoryChange(null),
    });
  }

  if (state.tagSlug) {
    const tag = tags.find((t) => t.slug === state.tagSlug);
    active.push({
      id: "tag",
      label: tag
        ? `Etiqueta: ${tag.name.replace(/^#+/, "").slice(0, 32)}`
        : "Etiqueta",
      onRemove: () => handlers.onTagChange(null),
    });
  }

  if (state.onlyDestacado) {
    active.push({
      id: "destacado",
      label: "Solo destacados",
      onRemove: () => handlers.onDestacadoChange(false),
    });
  }

  if (state.onlyPromo) {
    active.push({
      id: "promo",
      label: "En promoción",
      onRemove: () => handlers.onPromoChange(false),
    });
  }

  return active;
}

export function hasActiveFilters(state: CatalogFilterState): boolean {
  return Boolean(
    state.search.trim() ||
      state.categorySlug ||
      state.tagSlug ||
      state.onlyDestacado ||
      state.onlyPromo
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-widest text-travel-ink-muted mb-2">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-all ${
        active
          ? "bg-sky-100 border-euforia-sky text-euforia-sky-dark"
          : "border-sky-200 text-travel-ink-muted hover:border-euforia-sky/40 hover:text-travel-ink"
      }`}
    >
      {children}
    </button>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
