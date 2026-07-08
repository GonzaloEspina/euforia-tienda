"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type NavDropdownItem = {
  href: string;
  label: string;
  external?: boolean;
};

type Props = {
  label: string;
  items: NavDropdownItem[];
  inverted?: boolean;
};

export function NavDropdown({ label, items, inverted = true }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const buttonClass = inverted
    ? "px-2.5 py-2 rounded-lg text-sm font-medium text-white/95 hover:bg-white/10 transition-all inline-flex items-center gap-1"
    : "px-2.5 py-2 rounded-lg text-sm font-medium text-travel-ink hover:bg-sky-50 transition-all inline-flex items-center gap-1";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className={buttonClass}
      >
        {label}
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[220px] rounded-xl border border-sky-100 bg-white py-1.5 shadow-xl">
          {items.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2.5 text-sm font-medium text-travel-ink hover:bg-sky-50 hover:text-euforia-sky-dark"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2.5 text-sm font-medium text-travel-ink hover:bg-sky-50 hover:text-euforia-sky-dark"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}
