"use client";

import Image from "next/image";
import Link from "next/link";
import { staticUrl } from "@/lib/config";
import { PriceModeToggle } from "./PriceModeToggle";

const NAV = [
  { href: "/", label: "Salidas" },
  { href: "/cotizar/personalizada", label: "Cotización" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-sky-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 min-h-[4.5rem] py-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <Image
            src={staticUrl("/logo.png")}
            alt="Euforia Viajes"
            width={320}
            height={320}
            className="h-10 sm:h-11 w-auto object-contain rounded-md"
            priority
          />
          <span className="hidden md:block text-xs text-travel-ink-muted leading-tight">
            Tienda de salidas
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2 ml-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-xl text-sm sm:text-base font-medium text-travel-ink hover:text-euforia-sky-dark hover:bg-sky-50 transition-all"
            >
              {item.label}
            </Link>
          ))}
          <div className="hidden sm:block">
            <PriceModeToggle compact />
          </div>
        </nav>
      </div>
    </header>
  );
}
