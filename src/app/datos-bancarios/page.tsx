import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { BANK_DETAILS, COMPANY } from "@/lib/company-content";

export const metadata: Metadata = {
  title: "Datos bancarios",
  description:
    "Datos bancarios de Euforia Viajes para transferencias y pagos. Titular ROLLFER SRL.",
};

const FIELDS = [
  { label: "Titular", value: BANK_DETAILS.holder, copy: false },
  { label: "CUIT", value: BANK_DETAILS.cuit, copy: true },
  { label: "Alias", value: BANK_DETAILS.alias, copy: true },
  { label: "CVU", value: BANK_DETAILS.cvu, copy: true },
  { label: "Email", value: BANK_DETAILS.email, copy: true, href: `mailto:${BANK_DETAILS.email}` },
] as const;

export default function DatosBancariosPage() {
  return (
    <>
      <PageHero
        badge="Pagos y transferencias"
        title="Nuestros datos bancarios"
        subtitle="Utilizá estos datos para abonar señas o saldos de tus reservas con Euforia Viajes."
      />

      <section className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <div className="glass rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-euforia-sky-dark to-euforia-sky px-6 py-5 text-white">
            <p className="text-sm font-medium text-white/80">Titular</p>
            <p className="text-2xl font-black tracking-tight">{BANK_DETAILS.holder}</p>
          </div>

          <dl className="divide-y divide-sky-100">
            {FIELDS.slice(1).map((field) => (
              <div
                key={field.label}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-6 py-4"
              >
                <dt className="text-sm font-semibold text-euforia-sky-dark uppercase tracking-wide">
                  {field.label}
                </dt>
                <dd className="text-base font-mono font-semibold text-travel-ink break-all">
                  {"href" in field && field.href ? (
                    <a href={field.href} className="hover:text-euforia-sky-dark hover:underline">
                      {field.value}
                    </a>
                  ) : (
                    field.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <p className="font-semibold">Importante</p>
          <p className="mt-1">
            Enviá el comprobante de transferencia a{" "}
            <a href={`mailto:${COMPANY.email}`} className="font-semibold underline">
              {COMPANY.email}
            </a>{" "}
            indicando tu nombre, DNI y el número de reserva o salida contratada.
          </p>
        </div>
      </section>
    </>
  );
}
