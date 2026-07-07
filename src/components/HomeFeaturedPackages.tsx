"use client";

import Link from "next/link";
import type { Salida } from "@/types/salida";
import { SalidaCard } from "./SalidaCard";

type Props = {
  salidas: Salida[];
};

export function HomeFeaturedPackages({ salidas }: Props) {
  const featured = salidas
    .filter((s) => s.destacado)
    .concat(salidas.filter((s) => !s.destacado && s.enPromocion))
    .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i)
    .slice(0, 6);

  if (featured.length === 0) return null;

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {featured.map((salida) => (
        <SalidaCard key={salida.id} salida={salida} />
      ))}
    </div>
  );
}

export function HomeFeaturedPackagesAction() {
  return (
    <Link
      href="/#salidas"
      className="text-sm font-semibold text-euforia-sky-dark hover:underline"
    >
      Ver todos →
    </Link>
  );
}
