"use client";

import { getCheckoutUrl } from "@/lib/checkout-url";
import { useCheckoutCart } from "@/hooks/useCheckoutCart";

function CheckoutIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export function CheckoutCartButton() {
  const { hasItems } = useCheckoutCart();

  if (!hasItems) return null;

  return (
    <a
      href={getCheckoutUrl()}
      className="relative inline-flex items-center justify-center h-10 w-10 rounded-xl text-white hover:bg-white/10 transition-all"
      aria-label="Finalizar compra"
      title="Finalizar compra"
    >
      <CheckoutIcon />
      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-euforia-sky-dark ring-2 ring-white" />
    </a>
  );
}
