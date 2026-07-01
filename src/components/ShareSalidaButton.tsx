"use client";

import { useEffect, useRef, useState } from "react";
import { BASE_PATH } from "@/lib/config";

interface Props {
  slug: string;
}

function getShareUrl(slug: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${BASE_PATH}/salida/${slug}`;
  }
  return `https://viajaconeuforia.com${BASE_PATH}/salida/${slug}`;
}

const SHARE_MESSAGE = "¡Mirá esta salida de Euforia Viajes!";

function buildShareText(url: string): string {
  return `${SHARE_MESSAGE}\n${url}`;
}

export function ShareSalidaButton({ slug }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const url = getShareUrl(slug);
  const shareText = buildShareText(url);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: SHARE_MESSAGE, text: shareText });
        return;
      } catch {
        /* usuario canceló */
      }
    }
    setOpen((v) => !v);
  };

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      icon: "💬",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: "📘",
    },
    {
      label: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      icon: "𝕏",
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={shareNative}
        aria-label="Compartir salida"
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
      >
        <span aria-hidden>↗</span>
        Compartir
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-30 min-w-[200px] rounded-xl bg-white border border-sky-100 shadow-card py-2 animate-fade-in">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-travel-ink hover:bg-sky-50 transition-colors"
            >
              <span aria-hidden>{link.icon}</span>
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={copyLink}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-travel-ink hover:bg-sky-50 transition-colors text-left"
          >
            <span aria-hidden>🔗</span>
            {copied ? "¡Enlace copiado!" : "Copiar enlace"}
          </button>
        </div>
      )}
    </div>
  );
}
