"use client";

import { useEffect } from "react";

const WORDPRESS_ACCOUNT_URL = "https://viajaconeuforia.com/mi-cuenta/";

export default function MiCuentaPage() {
  useEffect(() => {
    window.location.replace(WORDPRESS_ACCOUNT_URL);
  }, []);

  return (
    <section className="max-w-md mx-auto px-4 py-20">
      <div className="glass rounded-2xl p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold text-travel-ink">Redirigiendo...</h1>
        <p className="text-travel-ink-muted">Te estamos llevando a tu cuenta en WordPress.</p>
      </div>
    </section>
  );
}
