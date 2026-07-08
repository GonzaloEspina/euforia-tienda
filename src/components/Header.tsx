"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getPublicHomeUrl, staticUrl } from "@/lib/config";
import { salidasGrupalesHref } from "@/lib/home-catalog";
import { CheckoutCartButton } from "./CheckoutCartButton";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { NavDropdown } from "./NavDropdown";
import { PriceModeToggle } from "./PriceModeToggle";

const SITE_URL = "https://viajaconeuforia.com";
const WHATSAPP_URL =
  "https://wa.me/5492804321400?text=" +
  encodeURIComponent("Hola! Me gustaría más información sobre ");

const MAIN_LINKS = [
  { href: getPublicHomeUrl(), label: "Inicio", external: true },
  { href: salidasGrupalesHref(), label: "Salidas Grupales", external: false },
  { href: "/cotizar/personalizada", label: "Armá tu Viaje", external: false },
  { href: "/blog", label: "Blog", external: false },
  { href: `${SITE_URL}/faq`, label: "FAQ", external: true },
  { href: "/quienes-somos#contacto", label: "Contacto", external: false },
] as const;

const COMPANY_LINKS = [
  { href: "/quienes-somos", label: "Quiénes somos" },
  { href: "/datos-bancarios", label: "Datos bancarios" },
  { href: "/condiciones-generales", label: "Condiciones generales" },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-euforia-sky-dark text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 min-h-[4.25rem] py-2 grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <a href={getPublicHomeUrl()} className="flex items-center gap-2.5 shrink-0 group">
          <Image
            src={staticUrl("/logo.png")}
            alt="Euforia Viajes"
            width={320}
            height={320}
            className="h-9 sm:h-10 w-auto object-contain rounded-md bg-white/95 p-0.5"
            priority
          />
          <span className="font-black tracking-wide text-lg sm:text-xl">EUFORIA</span>
        </a>

        <nav className="hidden xl:flex flex-wrap items-center justify-center gap-0.5">
          {MAIN_LINKS.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target={item.href.includes(SITE_URL) ? undefined : "_blank"}
                rel={
                  item.href.includes(SITE_URL) ? undefined : "noopener noreferrer"
                }
                className="px-2.5 py-2 rounded-lg text-sm font-medium text-white/95 hover:bg-white/10 transition-all"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="px-2.5 py-2 rounded-lg text-sm font-medium text-white/95 hover:bg-white/10 transition-all"
              >
                {item.label}
              </Link>
            )
          )}
          <NavDropdown label="Empresa" items={[...COMPANY_LINKS]} />
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-0.5 sm:gap-1">
          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
            className="xl:hidden px-2 py-2 rounded-lg text-white/95 hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
          <nav className="hidden sm:flex xl:hidden flex-wrap items-center justify-end gap-0.5">
            <Link
              href={salidasGrupalesHref()}
              className="px-2 py-2 rounded-lg text-xs font-medium text-white/95 hover:bg-white/10"
            >
              Salidas
            </Link>
            <Link
              href="/cotizar/personalizada"
              className="px-2 py-2 rounded-lg text-xs font-medium text-white/95 hover:bg-white/10"
            >
              Cotizar
            </Link>
          </nav>
          <GoogleAuthButton />
          <CheckoutCartButton />
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex px-3 py-2 rounded-full text-sm font-bold bg-white text-euforia-sky-dark hover:bg-sky-50 transition-colors"
          >
            WhatsApp
          </a>
          <div className="hidden lg:block">
            <PriceModeToggle compact inverted />
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <nav className="xl:hidden border-t border-white/10 bg-euforia-sky-dark/98 backdrop-blur px-4 py-3 space-y-1">
          {MAIN_LINKS.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/95 hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/95 hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
          <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-white/60">
            Empresa
          </p>
          {COMPANY_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/95 hover:bg-white/10 pl-5"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
