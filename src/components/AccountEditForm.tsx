"use client";

import { FormEvent, useEffect, useState } from "react";
import { updateWpAccount, type WpSession } from "@/lib/wp-session";

type Props = {
  session: WpSession;
  onUpdated: (session: WpSession) => void;
};

export function AccountEditForm({ session, onUpdated }: Props) {
  const billing = session.billing ?? {};
  const [firstName, setFirstName] = useState(billing.first_name ?? "");
  const [lastName, setLastName] = useState(billing.last_name ?? "");
  const [phone, setPhone] = useState(billing.phone ?? "");
  const [city, setCity] = useState(billing.city ?? "");
  const [state, setState] = useState(billing.state ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(billing.first_name ?? "");
    setLastName(billing.last_name ?? "");
    setPhone(billing.phone ?? "");
    setCity(billing.city ?? "");
    setState(billing.state ?? "");
  }, [session, billing]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateWpAccount({
        first_name: firstName,
        last_name: lastName,
        phone,
        city,
        state,
      });
      onUpdated(updated);
      setSuccess("Datos actualizados correctamente.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron guardar los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="glass rounded-xl p-4 space-y-3 max-w-lg">
      <div>
        <h2 className="text-sm font-semibold text-travel-ink">Mis datos</h2>
        <p className="text-xs text-travel-ink-muted mt-0.5">
          Actualizá tu información de contacto.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-xs font-medium">Nombre</span>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium">Apellido</span>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-medium">Teléfono</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium">Provincia</span>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium">Ciudad</span>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {error ? (
        <p className="text-xs text-red-600 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-xs text-emerald-700 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-euforia-sky-dark text-white text-sm font-semibold disabled:opacity-60"
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
