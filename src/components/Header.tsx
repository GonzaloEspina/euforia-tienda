"use client";

import Image from "next/image";
import Link from "next/link";
import { staticUrl } from "@/lib/config";
import { PriceModeToggle } from "./PriceModeToggle";
import { CheckoutCartButton } from "./CheckoutCartButton";
import { GoogleAuthButton } from "./GoogleAuthButton";

const SITE_URL = "https://viajaconeuforia.com";
const WHATSAPP_URL =
  "https://wa.me/5492804321400?text=" +
  encodeURIComponent("Hola! Me gustaría más información sobre ");

const NAV = [
  { href: "/", label: "Inicio", external: false },
  { href: "/#salidas", label: "Salidas Grupales", external: false },
  { href: "/cotizar/personalizada", label: "Armá tu Viaje", external: false },
  { href: `${SITE_URL}/blog`, label: "Blog", external: true },
  { href: `${SITE_URL}/nosotros`, label: "Nosotros", external: true },
  { href: `${SITE_URL}/faq`, label: "FAQ", external: true },
  { href: WHATSAPP_URL, label: "Contacto", external: true },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-euforia-sky-dark text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 min-h-[4.25rem] py-2 grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <Image
            src={staticUrl("/logo.png")}
            alt="Euforia Viajes"
            width={320}
            height={320}
            className="h-9 sm:h-10 w-auto object-contain rounded-md bg-white/95 p-0.5"
            priority
          />
          <span className="font-black tracking-wide text-lg sm:text-xl">EUFORIA</span>
        </Link>

        <nav className="hidden xl:flex flex-wrap items-center justify-center gap-0.5">
          {NAV.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
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
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-0.5 sm:gap-1">
          <nav className="flex xl:hidden flex-wrap items-center justify-end gap-0.5">
            <Link
              href="/#salidas"
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
    </header>
  );
}
