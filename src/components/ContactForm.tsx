"use client";

import { FormEvent, useState } from "react";
import { apiUrl } from "@/lib/config";

type Props = {
  id?: string;
};

export function ContactForm({ id = "contacto" }: Props) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [pasajeros, setPasajeros] = useState("");
  const [menores, setMenores] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl("/api/contacto"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          whatsapp,
          pasajeros: pasajeros || undefined,
          menores: menores || undefined,
          mensaje,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "No se pudo enviar el formulario");
      }

      setSuccess(true);
      setNombre("");
      setEmail("");
      setWhatsapp("");
      setPasajeros("");
      setMenores("");
      setMensaje("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al enviar");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-center">
        <p className="text-lg font-semibold text-emerald-800">¡Gracias por escribirnos!</p>
        <p className="text-sm text-emerald-700 mt-2">
          Recibimos tu consulta. Un asesor de Euforia Viajes se comunicará a la brevedad.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm font-semibold text-euforia-sky-dark hover:underline"
        >
          Enviar otra consulta
        </button>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-travel-ink">Nombre *</span>
          <input
            required
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm bg-white"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-travel-ink">Correo *</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm bg-white"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-travel-ink">WhatsApp *</span>
          <input
            required
            type="tel"
            placeholder="Ej: 280 432-1400"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm bg-white"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-travel-ink">Cantidad de pasajeros</span>
          <input
            type="number"
            min={1}
            value={pasajeros}
            onChange={(e) => setPasajeros(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm bg-white"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-travel-ink">Cantidad de menores</span>
          <input
            type="number"
            min={0}
            value={menores}
            onChange={(e) => setMenores(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm bg-white"
          />
        </label>
        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-travel-ink">Mensaje *</span>
          <textarea
            required
            rows={4}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm bg-white resize-y"
          />
        </label>
      </div>

      {error ? (
        <p className="text-sm text-red-600 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 rounded-xl bg-euforia-sky-dark text-white text-sm font-semibold hover:bg-euforia-sky transition-colors disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Enviar consulta"}
      </button>
    </form>
  );
}
