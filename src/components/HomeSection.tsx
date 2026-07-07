import type { ReactNode } from "react";

type HomeSectionProps = {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: string;
  variant?: "white" | "soft" | "sky";
  action?: ReactNode;
  children: ReactNode;
};

const VARIANTS = {
  white: "bg-white border-sky-100",
  soft: "bg-travel-bg-soft border-sky-100/80",
  sky: "bg-travel-bg border-sky-100/80",
} as const;

export function HomeSection({
  id,
  title,
  subtitle,
  icon,
  variant = "soft",
  action,
  children,
}: HomeSectionProps) {
  return (
    <section
      id={id}
      className={`py-12 sm:py-14 border-b scroll-mt-28 ${VARIANTS[variant]}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-travel-ink">
              {icon ? <span className="mr-2">{icon}</span> : null}
              {title}
            </h2>
            {subtitle ? (
              <p className="text-travel-ink-muted mt-2 max-w-2xl">{subtitle}</p>
            ) : null}
          </div>
          {action ? <div className="flex justify-center sm:justify-end">{action}</div> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
