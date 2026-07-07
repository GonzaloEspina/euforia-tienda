"use client";

import { FormEvent, useEffect, useState } from "react";
import { ACCOUNT_PAGE_URL, getTiendaAccountUrl } from "@/lib/config";
import { getWooSiteUrl } from "@/lib/checkout-url";
import { wpLogin, type WpSession } from "@/lib/wp-session";

type Props = {
  onSuccess?: (session: WpSession) => void;
};

export function WpLoginForm({ onSuccess }: Props) {
  const loginUrl = `${getWooSiteUrl()}/wp-login.php`;
  const returnTo = getTiendaAccountUrl();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useFallbackForm, setUseFallbackForm] = useState(false);

  useEffect(() => {
    document.cookie = "wordpress_test_cookie=WP%20Cookie%20check; path=/; SameSite=Lax";
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await wpLogin(username, password);
      onSuccess?.(session);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo iniciar sesión.";
      if (message.includes("404") || message.toLowerCase().includes("route")) {
        setUseFallbackForm(true);
        setError(
          "Falta actualizar el plugin Euforia Puntos en WordPress (v1.0.4). Usá el formulario alternativo abajo."
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-travel-ink">Ingresá a tu cuenta</h2>
        <p className="text-sm text-travel-ink-muted mt-1">
          Usá el mismo usuario y contraseña de Euforia Viajes.
        </p>
      </div>

      {!useFallbackForm ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-travel-ink">Email o usuario</span>
            <input
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-sky-200 px-3 py-2.5"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-travel-ink">Contraseña</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-sky-200 px-3 py-2.5"
            />
          </label>

          {error ? (
            <p className="text-sm text-red-600 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-euforia-sky-dark text-white font-semibold hover:bg-euforia-sky transition-colors disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      ) : (
        <form action={loginUrl} method="post" className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-travel-ink">Email o usuario</span>
            <input
              name="log"
              type="text"
              autoComplete="username"
              required
              defaultValue={username}
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
          <input type="hidden" name="testcookie" value="1" />

          {error ? (
            <p className="text-sm text-amber-700 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-euforia-sky-dark text-white font-semibold hover:bg-euforia-sky transition-colors"
          >
            Ingresar (alternativo)
          </button>
        </form>
      )}

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
