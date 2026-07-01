"use client";

import type { CatalogSort } from "@/lib/catalog-sort";
import { CATALOG_SORT_OPTIONS } from "@/lib/catalog-sort";

export interface ActiveFilter {
  id: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFiltersBarProps {
  filters: ActiveFilter[];
  onClearAll: () => void;
  totalCount: number;
  pageStart: number;
  pageEnd: number;
  sort: CatalogSort;
  onSortChange: (sort: CatalogSort) => void;
}

export function ActiveFiltersBar({
  filters,
  onClearAll,
  totalCount,
  pageStart,
  pageEnd,
  sort,
  onSortChange,
}: ActiveFiltersBarProps) {
  const hasFilters = filters.length > 0;

  const countLabel =
    totalCount === 0
      ? "0 salidas"
      : totalCount === 1
        ? "1 salida"
        : `${pageStart}–${pageEnd} de ${totalCount} salidas`;

  return (
    <div className="sticky top-[4.5rem] z-40 mb-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-white border border-sky-200 px-4 py-3.5 shadow-sm min-h-[3.25rem]">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {hasFilters ? (
            <>
              <span className="text-sm font-semibold text-travel-ink-muted uppercase tracking-wide shrink-0">
                Filtros:
              </span>
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={f.onRemove}
                  className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-sm font-medium bg-sky-50 border border-sky-200 text-euforia-sky-dark hover:bg-sky-100 transition-colors group"
                  title={`Quitar filtro: ${f.label}`}
                >
                  <span className="max-w-[200px] truncate">{f.label}</span>
                  <span
                    className="w-5 h-5 rounded-full bg-sky-200/80 flex items-center justify-center text-xs group-hover:bg-sky-300"
                    aria-hidden
                  >
                    ×
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={onClearAll}
                className="text-sm font-medium text-travel-ink-muted hover:text-red-500 underline underline-offset-2 shrink-0"
              >
                Borrar todos
              </button>
            </>
          ) : (
            <span className="text-sm text-travel-ink-muted">
              Sin filtros activos
            </span>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-travel-ink-muted shrink-0">
          <span className="whitespace-nowrap">Ordenar</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as CatalogSort)}
            className="h-9 px-3 rounded-lg bg-white border border-sky-200 text-travel-ink text-sm focus:outline-none focus:border-euforia-sky focus:ring-2 focus:ring-euforia-sky/20"
            aria-label="Ordenar resultados"
          >
            {CATALOG_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <p className="text-sm text-travel-ink-muted shrink-0 whitespace-nowrap">
          {countLabel}
        </p>
      </div>
    </div>
  );
}
