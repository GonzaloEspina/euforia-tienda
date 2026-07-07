"use client";

import Link from "next/link";
import { DESTINATION_FILTERS, destinationHref } from "@/lib/home-catalog";

export function HomeExploreDestinations() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {DESTINATION_FILTERS.map((dest) => (
        <Link
          key={dest.id}
          href={destinationHref(dest.query)}
          className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white px-3 py-5 text-center shadow-sm hover:border-euforia-sky/50 hover:shadow-md transition-all"
        >
          <span className="text-2xl" aria-hidden>
            {dest.icon}
          </span>
          <span className="text-sm font-semibold text-travel-ink group-hover:text-euforia-sky-dark">
            {dest.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
