"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Salida } from "@/types/salida";
import type { CotizacionFormData } from "@/types/cotizacion";
import { apiUrl } from "@/lib/config";
import { validatePasajeros } from "@/lib/cotizacion-validate";
import {
  EDAD_MAXIMA,
  HABITACION_OPCIONES,
  initialCotizacionForm,
  isPasajeroMenor,
  NECESIDADES_LABELS,
  TRANSPORTE_OPCIONES,
} from "@/types/cotizacion";

const STEPS = [
  "Pasajeros",
  "Necesidades",
  "Preferencias",
  "Contacto",
  "Confirmar",
] as const;

interface Props {
  salida?: Salida;
  personalizada?: boolean;
}

function inputClass() {
  return "w-full px-4 py-3.5 rounded-xl bg-white border border-sky-200 focus:border-euforia-sky focus:outline-none focus:ring-2 focus:ring-euforia-sky/20 text-base text-travel-ink";
}

function labelClass() {
  return "block text-sm uppercase tracking-widest text-travel-ink-muted mb-2";
}

export function CotizacionWizard({ salida, personalizada = false }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CotizacionFormData>(() =>
    initialCotizacionForm(1)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingFromConfirm, setEditingFromConfirm] = useState(false);

  const progress = ((step + 1) / STEPS.length) * 100;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  const updatePasajerosCount = (count: number) => {
    const n = Math.max(1, Math.min(20, count));
    setForm((prev) => {
      const pasajeros = [...prev.pasajeros];
      while (pasajeros.length < n) pasajeros.push({ nombre: "", edad: "", esMenor: false });
      while (pasajeros.length > n) pasajeros.pop();
      return { ...prev, cantidadPasajeros: n, pasajeros };
    });
  };

  const stepError = useMemo(() => {
    if (step === 0) {
      return validatePasajeros(form.pasajeros);
    }
    if (step === 2 && personalizada) {
      if (!form.destinoSueno.trim()) return "Contanos tu destino soñado";
    }
    if (step === 3) {
      if (!form.contacto.nombre.trim()) return "Tu nombre es requerido";
      if (!form.contacto.whatsapp.trim()) return "Tu WhatsApp es requerido";
      const digits = form.contacto.whatsapp.replace(/\D/g, "");
      if (digits.length < 8) return "Ingresá un WhatsApp válido";
      if (form.contacto.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contacto.email)) {
        return "Email inválido";
      }
    }
    return null;
  }, [step, form, personalizada]);

  const goNext = () => {
    if (stepError) {
      setError(stepError);
      return;
    }
    setError(null);
    if (editingFromConfirm) {
      setEditingFromConfirm(false);
      setStep(STEPS.length - 1);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError(null);
    if (editingFromConfirm) {
      setEditingFromConfirm(false);
      setStep(STEPS.length - 1);
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  };

  const goToStep = (targetStep: number) => {
    setError(null);
    setEditingFromConfirm(true);
    setStep(targetStep);
  };

  const validateBeforeSubmit = (): string | null => {
    const pasajerosError = validatePasajeros(form.pasajeros);
    if (pasajerosError) return pasajerosError;
    if (personalizada && !form.destinoSueno.trim()) {
      return "Contanos tu destino soñado";
    }
    if (!form.contacto.nombre.trim()) return "Tu nombre es requerido";
    if (!form.contacto.whatsapp.trim()) return "Tu WhatsApp es requerido";
    const digits = form.contacto.whatsapp.replace(/\D/g, "");
    if (digits.length < 8) return "Ingresá un WhatsApp válido";
    if (
      form.contacto.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contacto.email)
    ) {
      return "Email inválido";
    }
    return null;
  };

  const salidaLines = (personalizada
    ? [
        "Cotización a medida",
        form.destinoSueno.trim()
          ? `Destino soñado: ${form.destinoSueno.trim()}`
          : null,
      ].filter(Boolean)
    : [
        salida!.titulo,
        salida!.fecha ? `Fecha de salida: ${salida!.fecha}` : null,
        salida!.destino ? `Destino: ${salida!.destino}` : null,
        salida!.categoria ? `Categoría: ${salida!.categoria}` : null,
      ].filter(Boolean)) as string[];

  const pasajerosLines = [
    `Total: ${form.cantidadPasajeros} pasajero${form.cantidadPasajeros === 1 ? "" : "s"}`,
    ...form.pasajeros.map(
      (p, i) =>
        `${i + 1}. ${p.nombre} — ${p.edad} años${isPasajeroMenor(p.edad) ? " (menor de edad)" : ""}`
    ),
  ];

  const necesidadesLines = (() => {
    const items = (
      Object.keys(NECESIDADES_LABELS) as (keyof typeof NECESIDADES_LABELS)[]
    )
      .filter((key) => form.necesidades[key])
      .map((key) => NECESIDADES_LABELS[key]);
    if (form.necesidades.otros.trim()) {
      items.push(`Otros: ${form.necesidades.otros.trim()}`);
    }
    return items.length ? items : ["Ninguna indicada"];
  })();

  const preferenciasLines = [
    ...(personalizada && form.destinoSueno.trim()
      ? [`Destino soñado: ${form.destinoSueno.trim()}`]
      : []),
    `Transporte: ${
      form.transportePreferido.length
        ? form.transportePreferido.join(", ")
        : "Sin preferencia"
    }`,
    `Habitación: ${form.tipoHabitacion || "Sin preferencia"}`,
    `Fechas flexibles: ${form.fechasFlexibles ? "Sí" : "No"}`,
    ...(form.comentarios.trim()
      ? [`Comentarios: ${form.comentarios.trim()}`]
      : []),
  ];

  const contactoLines = [
    `Nombre: ${`${form.contacto.nombre} ${form.contacto.apellido}`.trim()}`,
    `WhatsApp: ${form.contacto.whatsapp}`,
    ...(form.contacto.email ? [`Email: ${form.contacto.email}`] : []),
    ...(form.contacto.ciudad ? [`Ciudad: ${form.contacto.ciudad}`] : []),
  ];

  const toggleTransporte = (opcion: string) => {
    setForm((prev) => {
      const has = prev.transportePreferido.includes(opcion);
      return {
        ...prev,
        transportePreferido: has
          ? prev.transportePreferido.filter((t) => t !== opcion)
          : [...prev.transportePreferido, opcion],
      };
    });
  };

  const handleSubmit = async () => {
    const validationError = validateBeforeSubmit();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...form,
        salidaId: personalizada ? 0 : salida!.id,
        salidaSlug: personalizada ? "personalizada" : salida!.slug,
        salidaTitulo: personalizada
          ? `Cotización a medida: ${form.destinoSueno.trim()}`
          : salida!.titulo,
        salidaFecha: personalizada ? undefined : salida!.fecha,
        salidaDestino: personalizada
          ? form.destinoSueno.trim()
          : salida!.destino,
        pasajeros: form.pasajeros.map((p) => ({
          ...p,
          esMenor: isPasajeroMenor(p.edad),
        })),
      };

      const res = await fetch(apiUrl("/api/cotizacion"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { ok: boolean; message?: string };

      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "No se pudo enviar la cotización");
      }

      const params = new URLSearchParams({
        salida: personalizada ? "personalizada" : salida!.slug,
        nombre: form.contacto.nombre,
      });
      router.push(`/cotizar/confirmacion?${params.toString()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href={personalizada ? "/" : `/salida/${salida!.slug}`}
          className="text-base text-travel-ink-muted hover:text-euforia-sky-dark"
        >
          {personalizada ? "← Volver al catálogo" : "← Volver a la salida"}
        </Link>
      </div>

      <div className="glass rounded-2xl p-5 mb-6 flex gap-4 items-center">
        {!personalizada && salida!.imagenes[0] && (
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
            <Image
              src={salida!.imagenes[0]}
              alt={salida!.titulo}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm text-euforia-sky-dark uppercase tracking-widest mb-1">
            {personalizada ? "Cotización a medida" : "Solicitar cotización"}
          </p>
          <h1 className="font-bold leading-snug line-clamp-2">
            {personalizada
              ? "¿No encontrás la salida que buscás?"
              : salida!.titulo}
          </h1>
          {personalizada ? (
            <p className="text-sm text-travel-ink-muted mt-1">
              Elegí tu destino soñado y nosotros lo hacemos realidad.
            </p>
          ) : (
            salida!.fecha && (
              <p className="text-sm text-travel-ink-muted mt-1">📅 {salida!.fecha}</p>
            )
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-travel-ink-muted mb-2">
          <span>
            Paso {step + 1} de {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="h-1.5 rounded-full bg-sky-100 overflow-hidden">
          <div
            className="h-full bg-euforia-sky-dark transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-5 animate-slide-up">
        {step === 0 && (
          <>
            <div>
              <label className={labelClass()}>Cantidad de pasajeros</label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.cantidadPasajeros}
                onChange={(e) => updatePasajerosCount(Number(e.target.value))}
                className={inputClass()}
              />
            </div>

            {form.pasajeros.map((p, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-sky-50 border border-sky-100 space-y-3"
              >
                <p className="text-base font-semibold text-euforia-sky-dark">
                  Pasajero {i + 1}
                </p>
                <div>
                  <label className={labelClass()}>Nombre completo *</label>
                  <input
                    type="text"
                    value={p.nombre}
                    onChange={(e) => {
                      const pasajeros = [...form.pasajeros];
                      pasajeros[i] = { ...pasajeros[i], nombre: e.target.value };
                      setForm({ ...form, pasajeros });
                    }}
                    className={`${inputClass()} placeholder:text-transparent sm:placeholder:text-travel-ink-muted`}
                    placeholder="Como figura en el documento"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass()}>Edad *</label>
                  <input
                    type="number"
                    min={0}
                    max={EDAD_MAXIMA}
                    value={p.edad}
                    onChange={(e) => {
                      const edad = e.target.value;
                      const pasajeros = [...form.pasajeros];
                      pasajeros[i] = {
                        ...pasajeros[i],
                        edad,
                        esMenor: isPasajeroMenor(edad),
                      };
                      setForm({ ...form, pasajeros });
                    }}
                    className={inputClass()}
                    required
                  />
                </div>
              </div>
            ))}
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-base text-travel-ink-muted">
              Marcá todo lo que aplique para que podamos preparar el viaje con las
              comodidades necesarias.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {(Object.keys(NECESIDADES_LABELS) as (keyof typeof NECESIDADES_LABELS)[]).map(
                (key) => (
                  <label
                    key={key}
                    className="flex items-start gap-3 p-3 rounded-xl bg-sky-50 border border-sky-100 cursor-pointer hover:border-euforia-sky/30"
                  >
                    <input
                      type="checkbox"
                      checked={form.necesidades[key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          necesidades: {
                            ...form.necesidades,
                            [key]: e.target.checked,
                          },
                        })
                      }
                      className="mt-0.5 rounded border-sky-300"
                    />
                    <span className="text-base">{NECESIDADES_LABELS[key]}</span>
                  </label>
                )
              )}
            </div>
            <div>
              <label className={labelClass()}>Otras necesidades o alergias</label>
              <textarea
                value={form.necesidades.otros}
                onChange={(e) =>
                  setForm({
                    ...form,
                    necesidades: { ...form.necesidades, otros: e.target.value },
                  })
                }
                rows={3}
                className={inputClass()}
                placeholder="Ej: alergia a frutos secos, necesita baño adaptado..."
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {personalizada && (
              <div>
                <label className={labelClass()}>¿A dónde querés viajar? *</label>
                <input
                  type="text"
                  value={form.destinoSueno}
                  onChange={(e) =>
                    setForm({ ...form, destinoSueno: e.target.value })
                  }
                  className={inputClass()}
                  placeholder="Ej: Europa en grupo, Caribe, crucero por el Mediterráneo..."
                  required
                />
              </div>
            )}

            <div>
              <label className={labelClass()}>Transporte preferido</label>
              <div className="flex flex-wrap gap-2">
                {TRANSPORTE_OPCIONES.map((t) => {
                  const active = form.transportePreferido.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTransporte(t)}
                      className={`px-3.5 py-2 rounded-full text-sm border transition-all ${
                        active
                          ? "bg-sky-100 border-euforia-sky text-euforia-sky-dark"
                          : "bg-white border-sky-200 text-travel-ink-muted hover:border-euforia-sky/40"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClass()}>Tipo de habitación</label>
              <select
                value={form.tipoHabitacion}
                onChange={(e) =>
                  setForm({ ...form, tipoHabitacion: e.target.value })
                }
                className={inputClass()}
              >
                {HABITACION_OPCIONES.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.fechasFlexibles}
                onChange={(e) =>
                  setForm({ ...form, fechasFlexibles: e.target.checked })
                }
                className="rounded border-sky-300"
              />
              <span className="text-base">Tengo flexibilidad con las fechas</span>
            </label>

            <div>
              <label className={labelClass()}>Comentarios adicionales</label>
              <textarea
                value={form.comentarios}
                onChange={(e) =>
                  setForm({ ...form, comentarios: e.target.value })
                }
                rows={4}
                className={inputClass()}
                placeholder="Contanos qué te gustaría del viaje, presupuesto aproximado, etc."
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
              <p className="text-base">
                📱 Ingresá tu <strong>WhatsApp</strong> para que un asesor te
                contacte y continúe la conversación por ese medio.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass()}>Nombre</label>
                <input
                  type="text"
                  value={form.contacto.nombre}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contacto: { ...form.contacto, nombre: e.target.value },
                    })
                  }
                  className={inputClass()}
                />
              </div>
              <div>
                <label className={labelClass()}>Apellido</label>
                <input
                  type="text"
                  value={form.contacto.apellido}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contacto: { ...form.contacto, apellido: e.target.value },
                    })
                  }
                  className={inputClass()}
                />
              </div>
            </div>

            <div>
              <label className={labelClass()}>WhatsApp *</label>
              <input
                type="tel"
                value={form.contacto.whatsapp}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contacto: { ...form.contacto, whatsapp: e.target.value },
                  })
                }
                className={inputClass()}
                placeholder="Ej: 11 2345 6789 o +54 9 11 2345 6789"
                autoComplete="tel"
              />
              <p className="text-sm text-travel-ink-muted mt-1.5">
                Con código de área. Si estás en Argentina, podés ingresar solo el
                número local.
              </p>
            </div>

            <div>
              <label className={labelClass()}>Email (opcional)</label>
              <input
                type="email"
                value={form.contacto.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contacto: { ...form.contacto, email: e.target.value },
                  })
                }
                className={inputClass()}
              />
            </div>

            <div>
              <label className={labelClass()}>Ciudad (opcional)</label>
              <input
                type="text"
                value={form.contacto.ciudad}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contacto: { ...form.contacto, ciudad: e.target.value },
                  })
                }
                className={inputClass()}
              />
            </div>
          </>
        )}

        {step === 4 && (
          <div className="space-y-4 text-base">
            <p className="text-travel-ink-muted">
              Revisá todos los datos antes de enviar. Podés editar cada sección
              con el lápiz. Un asesor verá esta información en Whapify.
            </p>
            <SummarySection title={personalizada ? "Viaje" : "Salida"} lines={salidaLines} />
            <SummarySection
              title="Pasajeros"
              lines={pasajerosLines}
              onEdit={() => goToStep(0)}
            />
            <SummarySection
              title="Necesidades especiales"
              lines={necesidadesLines}
              onEdit={() => goToStep(1)}
            />
            <SummarySection
              title="Preferencias"
              lines={preferenciasLines}
              onEdit={() => goToStep(2)}
            />
            <SummarySection
              title="Contacto"
              lines={contactoLines}
              onEdit={() => goToStep(3)}
            />
          </div>
        )}

        {error && (
          <p className="text-base text-red-400 text-center" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              disabled={submitting}
              className="flex-1 py-3.5 rounded-xl border border-sky-200 hover:border-sky-300 text-base font-medium"
            >
              Atrás
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 py-3.5 rounded-xl bg-euforia-sky-dark text-white font-bold text-base"
            >
              {editingFromConfirm ? "Guardar cambios" : "Continuar"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3.5 rounded-xl bg-euforia-sky-dark text-white font-bold text-base disabled:opacity-50"
            >
              {submitting ? "Enviando..." : "Enviar cotización"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummarySection({
  title,
  lines,
  onEdit,
}: {
  title: string;
  lines: string[];
  onEdit?: () => void;
}) {
  return (
    <div className="p-4 rounded-xl bg-sky-50 border border-sky-100">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-sm uppercase tracking-widest text-travel-ink-muted">
          {title}
        </p>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-travel-ink-muted hover:text-euforia-sky-dark hover:bg-sky-100 transition-colors"
            aria-label={`Editar ${title}`}
          >
            <PencilIcon />
            <span className="hidden sm:inline">Editar</span>
          </button>
        )}
      </div>
      <ul className="space-y-1.5">
        {lines.map((line, index) => (
          <li key={`${title}-${index}`} className="leading-relaxed">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}
