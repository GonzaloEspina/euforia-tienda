import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: ReactNode;
};

export function PageHero({ title, subtitle, badge, children }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-euforia-sky-dark via-euforia-sky to-sky-300 text-white">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_55%)]" />
      <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16">
        {badge ? (
          <p className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide mb-4">
            {badge}
          </p>
        ) : null}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight max-w-3xl">{title}</h1>
        {subtitle ? (
          <p className="mt-3 text-base sm:text-lg text-white/90 max-w-2xl">{subtitle}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
