"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

const CANONICAL_TIENDA_URL = "https://viajaconeuforia.com/tienda";

export function GoogleAuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="px-3 py-2 rounded-xl text-sm sm:text-base text-travel-ink-muted">
        Cuenta...
      </span>
    );
  }

  if (session?.user) {
    return (
      <>
        <Link
          href="/mi-cuenta"
          className="px-3 py-2 rounded-xl text-sm sm:text-base font-medium text-travel-ink hover:text-euforia-sky-dark hover:bg-sky-50 transition-all"
          title={session.user.email ?? "Mi cuenta"}
        >
          Mi cuenta
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: CANONICAL_TIENDA_URL })}
          className="px-3 py-2 rounded-xl text-sm sm:text-base font-medium text-travel-ink hover:text-euforia-sky-dark hover:bg-sky-50 transition-all"
          title={session.user.email ?? "Cerrar sesión"}
        >
          Salir
        </button>
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: CANONICAL_TIENDA_URL })}
      className="px-3 py-2 rounded-xl text-sm sm:text-base font-medium text-travel-ink hover:text-euforia-sky-dark hover:bg-sky-50 transition-all"
    >
      Ingresar
    </button>
  );
}
