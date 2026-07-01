"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PriceCurrencyMode } from "@/types/salida";

const PRICE_MODE_KEY = "euforia-price-mode";

interface AppPreferences {
  priceMode: PriceCurrencyMode;
  setPriceMode: (mode: PriceCurrencyMode) => void;
}

const PreferencesContext = createContext<AppPreferences | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [priceMode, setPriceModeState] = useState<PriceCurrencyMode>("both");

  useEffect(() => {
    const stored = localStorage.getItem(PRICE_MODE_KEY) as PriceCurrencyMode | null;
    if (stored === "ars" || stored === "usd" || stored === "both") {
      setPriceModeState(stored);
    }
  }, []);

  const setPriceMode = useCallback((mode: PriceCurrencyMode) => {
    setPriceModeState(mode);
    localStorage.setItem(PRICE_MODE_KEY, mode);
  }, []);

  const value = useMemo(
    () => ({ priceMode, setPriceMode }),
    [priceMode, setPriceMode]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
