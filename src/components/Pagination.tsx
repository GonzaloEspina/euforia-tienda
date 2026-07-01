"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav
      className="flex items-center justify-center gap-1 mt-8"
      aria-label="Paginación"
    >
      <PageButton
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        label="Anterior"
      >
        ←
      </PageButton>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-travel-ink-muted text-base">
            …
          </span>
        ) : (
          <PageButton
            key={p}
            active={p === page}
            onClick={() => onPageChange(p)}
            label={`Página ${p}`}
          >
            {p}
          </PageButton>
        )
      )}

      <PageButton
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        label="Siguiente"
      >
        →
      </PageButton>
    </nav>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`min-w-[40px] h-10 px-2.5 rounded-lg text-base font-medium transition-all ${
        active
          ? "bg-euforia-sky-dark text-white shadow-sm"
          : disabled
            ? "text-travel-ink-muted/40 cursor-not-allowed"
            : "text-travel-ink-muted hover:bg-sky-100 hover:text-euforia-sky-dark"
      }`}
    >
      {children}
    </button>
  );
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");

  pages.push(total);
  return pages;
}
