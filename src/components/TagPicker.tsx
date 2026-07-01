"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { normalizeSearch } from "@/lib/format";

interface TagPickerProps {
  tags: { name: string; slug: string }[];
  selectedSlug: string | null;
  onChange: (slug: string | null) => void;
}

export function TagPicker({ tags, selectedSlug, onChange }: TagPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = tags.find((t) => t.slug === selectedSlug);

  const filtered = useMemo(() => {
    if (!query.trim()) return tags;
    const q = normalizeSearch(query);
    return tags.filter((t) => normalizeSearch(t.name).includes(q));
  }, [tags, query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = (name: string) => {
    const clean = name.replace(/^#+/, "").trim();
    return clean.length > 42 ? `${clean.slice(0, 42)}…` : clean;
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="text-sm font-semibold uppercase tracking-widest text-travel-ink-muted mb-2 block">
        Etiquetas
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-3 rounded-xl bg-white border border-sky-200 hover:border-euforia-sky/40 text-base text-left transition-all"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={selected ? "text-travel-ink truncate" : "text-travel-ink-muted"}>
          {selected ? displayName(selected.name) : "Todas las etiquetas"}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-white border border-sky-200 shadow-card overflow-hidden">
          <div className="p-2 border-b border-sky-100">
            <input
              type="search"
              placeholder="Buscar etiqueta..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-white border border-sky-200 text-base focus:outline-none focus:border-euforia-sky placeholder:text-travel-ink-muted"
              autoFocus
            />
          </div>
          <ul
            className="max-h-48 overflow-y-auto scrollbar-thin py-1"
            role="listbox"
          >
            <li>
              <button
                type="button"
                role="option"
                aria-selected={!selectedSlug}
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                  setQuery("");
                }}
                className={`w-full px-3 py-2.5 text-left text-base hover:bg-sky-50 ${
                  !selectedSlug ? "text-euforia-sky-dark" : "text-travel-ink-muted"
                }`}
              >
                Todas
              </button>
            </li>
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-travel-ink-muted">
                Sin resultados
              </li>
            ) : (
              filtered.map((tag) => (
                <li key={tag.slug}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedSlug === tag.slug}
                    onClick={() => {
                      onChange(tag.slug);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full px-3 py-2.5 text-left text-base hover:bg-sky-50 truncate ${
                      selectedSlug === tag.slug
                        ? "text-euforia-sky-dark font-medium"
                        : "text-travel-ink"
                    }`}
                    title={tag.name}
                  >
                    {displayName(tag.name)}
                  </button>
                </li>
              ))
            )}
          </ul>
          <p className="px-3 py-2 text-xs text-travel-ink-muted border-t border-sky-100">
            {tags.length} etiquetas · mostrando {filtered.length}
          </p>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`shrink-0 text-travel-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
