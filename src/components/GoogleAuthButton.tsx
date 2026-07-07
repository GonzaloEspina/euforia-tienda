"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const CANONICAL_TIENDA_URL = "https://viajaconeuforia.com/tienda";
const GOOGLE_SIGNIN_URL = `${CANONICAL_TIENDA_URL}/api/auth/signin/google`;

function goToGoogleSignIn(callbackUrl: string) {
  const target = `${GOOGLE_SIGNIN_URL}?callbackUrl=${encodeURIComponent(
    callbackUrl
  )}&prompt=select_account`;
  window.location.assign(target);
}

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
          onClick={() =>
            signOut({
              callbackUrl: `${CANONICAL_TIENDA_URL}/login`,
            })
          }
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
      onClick={() => goToGoogleSignIn(CANONICAL_TIENDA_URL)}
      className="px-3 py-2 rounded-xl text-sm sm:text-base font-medium text-travel-ink hover:text-euforia-sky-dark hover:bg-sky-50 transition-all"
    >
      Ingresar
    </button>
  );
}
