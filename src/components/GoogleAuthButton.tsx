"use client";

import Link from "next/link";
const WORDPRESS_ACCOUNT_URL = "https://viajaconeuforia.com/mi-cuenta/";

export function GoogleAuthButton() {
  return (
    <Link
      href={WORDPRESS_ACCOUNT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-white/95 hover:bg-white/10 transition-all"
    >
      Mi cuenta
    </Link>
  );
}
