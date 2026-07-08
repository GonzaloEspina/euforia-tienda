"use client";

import { useState } from "react";

type Props = {
  value: string;
  label?: string;
};

export function CopyToClipboardButton({ value, label = "Copiar" }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback silencioso */
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="shrink-0 px-3 py-1.5 rounded-lg border border-sky-200 text-xs font-semibold text-euforia-sky-dark hover:bg-sky-50 transition-colors"
    >
      {copied ? "Copiado" : label}
    </button>
  );
}
