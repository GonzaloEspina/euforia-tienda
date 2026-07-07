"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  return (
    <section className="max-w-md mx-auto px-4 py-20">
      <div className="glass rounded-2xl p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold text-travel-ink">Ingresar a tu cuenta</h1>
        <p className="text-travel-ink-muted">
          Accedé con Google para unificar sesión entre la web principal y la tienda.
        </p>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/tienda" })}
          className="w-full py-3 rounded-xl bg-euforia-sky-dark text-white font-semibold hover:bg-euforia-sky transition-colors"
        >
          Continuar con Google
        </button>
      </div>
    </section>
  );
}
