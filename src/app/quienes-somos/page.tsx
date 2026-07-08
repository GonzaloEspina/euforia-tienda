import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";
import {
  ABOUT_PARAGRAPHS,
  BRANCHES,
  COMPANY,
} from "@/lib/company-content";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Conocé Euforia Viajes: agencia de turismo en Trelew, Chubut. Salidas grupales, asesoramiento personalizado y sucursales en la Patagonia.",
};

const INFO_CARDS = [
  {
    title: "Oficinas",
    value: COMPANY.address,
    href: COMPANY.addressHref,
    icon: "📍",
  },
  {
    title: "Horarios",
    value: COMPANY.hours,
    icon: "🕘",
  },
  {
    title: "Teléfono",
    value: COMPANY.phone,
    href: COMPANY.phoneHref,
    icon: "📞",
  },
  {
    title: "Email",
    value: COMPANY.email,
    href: `mailto:${COMPANY.email}`,
    icon: "✉️",
  },
] as const;

export default function QuienesSomosPage() {
  return (
    <>
      <PageHero
        badge={`Leg. ${COMPANY.legajo}`}
        title="Bienvenidos a Euforia Viajes"
        subtitle="Experiencias únicas en hotelería y excursiones, con salidas grupales a los mejores destinos de Argentina y el mundo."
      />

      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
          <div className="space-y-5">
            {ABOUT_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-travel-ink-muted leading-relaxed">
                {paragraph}
              </p>
            ))}
            <p className="text-sm text-travel-ink-muted pt-2">
              Para obtener más información sobre nuestros servicios, escribinos por los medios de
              contacto o completá el formulario.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {INFO_CARDS.map((card) => (
              <div
                key={card.title}
                className="glass rounded-2xl p-5 hover:shadow-md transition-shadow"
              >
                <p className="text-2xl mb-2">{card.icon}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-euforia-sky-dark">
                  {card.title}
                </p>
                {"href" in card && card.href ? (
                  <a
                    href={card.href}
                    target={card.href.startsWith("http") ? "_blank" : undefined}
                    rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-1 block text-sm font-semibold text-travel-ink hover:text-euforia-sky-dark"
                  >
                    {card.value}
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-travel-ink">{card.value}</p>
                )}
              </div>
            ))}

            <div className="glass rounded-2xl p-5 sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wide text-euforia-sky-dark">
                Seguinos
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  href={COMPANY.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-travel-ink hover:border-euforia-sky hover:text-euforia-sky-dark transition-colors"
                >
                  Instagram
                </a>
                <a
                  href={COMPANY.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-travel-ink hover:border-euforia-sky hover:text-euforia-sky-dark transition-colors"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="border-y border-sky-100 bg-travel-bg-soft py-12 sm:py-16 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-travel-ink">
              Dejanos tus datos y nos contactamos
            </h2>
            <p className="mt-3 text-travel-ink-muted max-w-lg">
              Completá el formulario y un asesor de Euforia Viajes te responderá a la brevedad por
              WhatsApp o correo electrónico.
            </p>
          </div>
          <div className="glass rounded-2xl p-6">
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-travel-ink text-center mb-8">
          ¡Acercate a cualquiera de nuestras sucursales!
        </h2>
        <div className="grid gap-8">
          {BRANCHES.map((branch) => (
            <div
              key={branch.name}
              className="grid lg:grid-cols-[280px_1fr] gap-6 rounded-2xl border border-sky-100 bg-white overflow-hidden shadow-sm"
            >
              <div className="p-6 flex flex-col justify-center bg-gradient-to-br from-sky-50 to-white">
                <h3 className="text-xl font-bold text-travel-ink">{branch.name}</h3>
                <p className="mt-2 text-travel-ink-muted">{branch.address}</p>
                <Link
                  href="/quienes-somos#contacto"
                  className="mt-4 inline-flex text-sm font-semibold text-euforia-sky-dark hover:underline"
                >
                  Consultanos →
                </Link>
              </div>
              <div className="min-h-[280px] bg-sky-50">
                <iframe
                  title={`Mapa ${branch.name}`}
                  src={COMPANY.mapEmbed}
                  className="w-full h-full min-h-[280px] border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
