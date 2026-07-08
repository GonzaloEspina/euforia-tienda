import type { Metadata } from "next";
import { BankDetailRow } from "@/components/BankDetailRow";
import { PageHero } from "@/components/PageHero";
import { BANK_DETAILS, COMPANY } from "@/lib/company-content";

export const metadata: Metadata = {
  title: "Datos bancarios",
  description:
    "Datos bancarios de Euforia Viajes para transferencias y pagos. Titular ROLLFER SRL.",
};

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
            <BankDetailRow label="CUIT" value={BANK_DETAILS.cuit} />
            <BankDetailRow label="Alias" value={BANK_DETAILS.alias} copyable />
            <BankDetailRow label="CVU" value={BANK_DETAILS.cvu} copyable />
            <BankDetailRow
              label="Email"
              value={BANK_DETAILS.email}
              href={`mailto:${BANK_DETAILS.email}`}
            />
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
