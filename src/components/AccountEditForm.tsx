"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AR_PROVINCES,
  getCitiesForProvince,
  profileFromSession,
} from "@/lib/argentina-locations";
import { fetchWpSession, updateWpAccount, type WpSession } from "@/lib/wp-session";

type Props = {
  session: WpSession;
  onUpdated: (session: WpSession) => void;
};

export function AccountEditForm({ session, onUpdated }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const applyProfile = (data: WpSession) => {
    const profile = profileFromSession(data);
    setFirstName(profile.first_name);
    setLastName(profile.last_name);
    setPhone(profile.phone);
    setCity(profile.city);
    setProvinceCode(profile.state);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoadingProfile(true);
      try {
        const fresh = await fetchWpSession();
        if (!cancelled && fresh.logged_in) {
          applyProfile(fresh);
          onUpdated(fresh);
        } else if (!cancelled) {
          applyProfile(session);
        }
      } catch {
        if (!cancelled) applyProfile(session);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cities = useMemo(
    () => getCitiesForProvince(provinceCode, city),
    [provinceCode, city]
  );

  const onProvinceChange = (code: string) => {
    setProvinceCode(code);
    const nextCities = getCitiesForProvince(code);
    setCity(nextCities[0] ?? "");
  };

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
        state: provinceCode,
        country: "AR",
      });
      onUpdated(updated);
      applyProfile(updated);
      setSuccess("Datos actualizados correctamente.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron guardar los datos.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="glass rounded-xl p-4 max-w-lg text-sm text-travel-ink-muted">
        Cargando tus datos...
      </div>
    );
  }

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
          <select
            value={provinceCode}
            onChange={(e) => onProvinceChange(e.target.value)}
            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm bg-white"
          >
            <option value="">Seleccioná una provincia</option>
            {AR_PROVINCES.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium">Ciudad</span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={!provinceCode}
            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm bg-white disabled:opacity-60"
          >
            <option value="">
              {provinceCode ? "Seleccioná una ciudad" : "Elegí provincia primero"}
            </option>
            {cities.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
