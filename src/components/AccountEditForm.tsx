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
  const [email, setEmail] = useState(billing.email ?? session.email ?? "");
  const [phone, setPhone] = useState(billing.phone ?? "");
  const [address1, setAddress1] = useState(billing.address_1 ?? "");
  const [address2, setAddress2] = useState(billing.address_2 ?? "");
  const [city, setCity] = useState(billing.city ?? "");
  const [state, setState] = useState(billing.state ?? "");
  const [postcode, setPostcode] = useState(billing.postcode ?? "");
  const [country, setCountry] = useState(billing.country ?? "AR");
  const [dni, setDni] = useState(session.dni ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(billing.first_name ?? "");
    setLastName(billing.last_name ?? "");
    setEmail(billing.email ?? session.email ?? "");
    setPhone(billing.phone ?? "");
    setAddress1(billing.address_1 ?? "");
    setAddress2(billing.address_2 ?? "");
    setCity(billing.city ?? "");
    setState(billing.state ?? "");
    setPostcode(billing.postcode ?? "");
    setCountry(billing.country ?? "AR");
    setDni(session.dni ?? "");
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
        email,
        phone,
        address_1: address1,
        address_2: address2,
        city,
        state,
        postcode,
        country,
        dni,
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
    <form onSubmit={onSubmit} className="glass rounded-2xl p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-travel-ink">Mis datos</h2>
        <p className="text-sm text-travel-ink-muted mt-1">
          Editá tu información de contacto y facturación.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Nombre</span>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-3 py-2.5"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Apellido</span>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-3 py-2.5"
          />
        </label>
        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-3 py-2.5"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Teléfono</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-3 py-2.5"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">DNI</span>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-3 py-2.5"
          />
        </label>
        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium">Dirección</span>
          <input
            type="text"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-3 py-2.5"
          />
        </label>
        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium">Depto / piso (opcional)</span>
          <input
            type="text"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-3 py-2.5"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Ciudad</span>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-3 py-2.5"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Provincia</span>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-3 py-2.5"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Código postal</span>
          <input
            type="text"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-3 py-2.5"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">País</span>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-sky-200 px-3 py-2.5"
          />
        </label>
      </div>

      {error ? (
        <p className="text-sm text-red-600 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-emerald-700 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2.5 rounded-xl bg-euforia-sky-dark text-white font-semibold disabled:opacity-60"
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
