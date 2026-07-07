"use client";

import { ACCOUNT_PAGE_URL, getTiendaAccountUrl } from "@/lib/config";
import { getWooSiteUrl } from "@/lib/checkout-url";

export function WpLoginForm() {
  const loginUrl = `${getWooSiteUrl()}/wp-login.php`;
  const returnTo = getTiendaAccountUrl();

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-travel-ink">Ingresá a tu cuenta</h2>
        <p className="text-sm text-travel-ink-muted mt-1">
          Usá el mismo usuario y contraseña de Euforia Viajes.
        </p>
      </div>

      <form action={loginUrl} method="post" className="space-y-3">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-travel-ink">Email o usuario</span>
          <input
            name="log"
            type="text"
            autoComplete="username"
            required
            className="w-full rounded-xl border border-sky-200 px-3 py-2.5"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-travel-ink">Contraseña</span>
          <input
            name="pwd"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-sky-200 px-3 py-2.5"
          />
        </label>

        <input type="hidden" name="redirect_to" value={returnTo} />
        <input type="hidden" name="rememberme" value="forever" />

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-euforia-sky-dark text-white font-semibold hover:bg-euforia-sky transition-colors"
        >
          Ingresar
        </button>
      </form>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <a
          href={`${loginUrl}?action=lostpassword&redirect_to=${encodeURIComponent(returnTo)}`}
          className="text-euforia-sky-dark hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </a>
        <a href={ACCOUNT_PAGE_URL} className="text-euforia-sky-dark hover:underline">
          Crear cuenta en Euforia
        </a>
      </div>
    </div>
  );
}
