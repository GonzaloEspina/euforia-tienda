"use client";

import { useState } from "react";
import Link from "next/link";

export function PromoBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm sm:text-base">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <p className="flex-1 text-center sm:text-left">
          <span className="font-bold">Temporada de invierno 2026</span>
          <span className="hidden sm:inline">
            {" "}
            · Bariloche, Mendoza, el Norte y Brasil con financiación en cuotas.
          </span>{" "}
          <Link href="/#salidas" className="underline font-semibold whitespace-nowrap">
            Mirá las salidas
          </Link>
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="shrink-0 rounded-full px-2 py-0.5 text-white/90 hover:bg-white/15 transition-colors"
          aria-label="Cerrar aviso"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
