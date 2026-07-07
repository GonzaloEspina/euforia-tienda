"use client";

import { signIn, signOut, useSession } from "next-auth/react";

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
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/tienda" })}
        className="px-3 py-2 rounded-xl text-sm sm:text-base font-medium text-travel-ink hover:text-euforia-sky-dark hover:bg-sky-50 transition-all"
        title={session.user.email ?? "Cerrar sesión"}
      >
        Salir
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/tienda" })}
      className="px-3 py-2 rounded-xl text-sm sm:text-base font-medium text-travel-ink hover:text-euforia-sky-dark hover:bg-sky-50 transition-all"
    >
      Ingresar
    </button>
  );
}
