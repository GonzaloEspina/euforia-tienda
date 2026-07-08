import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { LEGAL_NOTICE, LEGAL_SECTIONS } from "@/lib/company-content";

export const metadata: Metadata = {
  title: "Condiciones generales",
  description:
    "Condiciones generales de contratación de Euforia Viajes. Legajo 16816. Servicios incluidos, cancelaciones, documentación y más.",
};

export default function CondicionesGeneralesPage() {
  return (
    <>
      <PageHero
        badge="Leg. 16816"
        title="Condiciones generales de contratación"
        subtitle={LEGAL_NOTICE}
      />

      <section className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <nav className="mb-10 rounded-2xl border border-sky-100 bg-white/80 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-euforia-sky-dark mb-3">
            Índice
          </p>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            {LEGAL_SECTIONS.map((section) => (
              <li key={section.title}>
                <a
                  href={`#${section.title.replace(/\s+/g, "-").toLowerCase()}`}
                  className="text-travel-ink-muted hover:text-euforia-sky-dark hover:underline"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-10">
          {LEGAL_SECTIONS.map((section) => (
            <article
              key={section.title}
              id={section.title.replace(/\s+/g, "-").toLowerCase()}
              className="scroll-mt-28 rounded-2xl border border-sky-100 bg-white p-6 sm:p-8 shadow-sm"
            >
              <h2 className="text-xl font-bold text-travel-ink">{section.title}</h2>

              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="mt-4 text-travel-ink-muted leading-relaxed">
                  {paragraph}
                </p>
              ))}

              {section.bullets ? (
                <ul className="mt-4 space-y-2 list-disc pl-5 text-travel-ink-muted">
                  {section.bullets.map((item) => (
                    <li key={item.slice(0, 48)}>{item}</li>
                  ))}
                </ul>
              ) : null}

              {section.subsections?.map((sub) => (
                <div key={sub.title} className="mt-5 rounded-xl bg-sky-50/80 p-4">
                  <h3 className="font-semibold text-travel-ink">{sub.title}</h3>
                  <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-travel-ink-muted">
                    {sub.bullets.map((item) => (
                      <li key={item.slice(0, 48)}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-travel-ink-muted">
          ¿Tenés dudas?{" "}
          <Link href="/quienes-somos#contacto" className="font-semibold text-euforia-sky-dark hover:underline">
            Contactanos
          </Link>
        </p>
      </section>
    </>
  );
}
