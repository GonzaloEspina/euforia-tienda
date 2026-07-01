"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

const PricingAsideContext =
  createContext<RefObject<HTMLElement | null> | null>(null);

const LayoutRevisionContext = createContext(0);

export function AsideLayout({
  pricing,
  children,
}: {
  pricing: ReactNode;
  children: ReactNode;
}) {
  const pricingRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [revision, setRevision] = useState(0);

  useLayoutEffect(() => {
    const bump = () => setRevision((n) => n + 1);

    const ro = new ResizeObserver(bump);
    if (contentRef.current) ro.observe(contentRef.current);
    if (pricingRef.current) ro.observe(pricingRef.current);

    window.addEventListener("resize", bump);
    window.addEventListener("load", bump);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", bump);
      window.removeEventListener("load", bump);
    };
  }, []);

  return (
    <PricingAsideContext.Provider value={pricingRef}>
      <LayoutRevisionContext.Provider value={revision}>
        <div className="relative">
          <aside
            ref={pricingRef}
            className="hidden md:block absolute top-0 right-0 w-5/12"
          >
            <div className="sticky top-20">{pricing}</div>
          </aside>
          <div
            ref={contentRef}
            className="space-y-6 md:space-y-8"
          >
            {children}
          </div>
        </div>
      </LayoutRevisionContext.Provider>
    </PricingAsideContext.Provider>
  );
}

/**
 * Ocupa 7/12 si la tarjeta de precios sigue a la altura de esta sección;
 * si no, ancho completo.
 */
export function AsideAwareSection({ children }: { children: ReactNode }) {
  const pricingRef = useContext(PricingAsideContext);
  const revision = useContext(LayoutRevisionContext);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [besidePricing, setBesidePricing] = useState(false);

  useLayoutEffect(() => {
    const check = () => {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      const section = sectionRef.current;
      const pricing = pricingRef?.current;

      if (!isDesktop || !section || !pricing) {
        setBesidePricing(false);
        return;
      }

      const sectionTop =
        section.getBoundingClientRect().top + window.scrollY;
      const pricingRect = pricing.getBoundingClientRect();
      const pricingBottom =
        pricingRect.top + window.scrollY + pricingRect.height;

      setBesidePricing(sectionTop < pricingBottom - 4);
    };

    check();
  }, [pricingRef, revision]);

  return (
    <div
      ref={sectionRef}
      className={
        besidePricing ? "md:max-w-[58.333%] md:pr-2" : "w-full"
      }
    >
      {children}
    </div>
  );
}
