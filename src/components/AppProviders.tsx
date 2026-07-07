"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { CartProvider } from "@/context/CartContext";
import { WhatsAppProvider } from "@/context/WhatsAppContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <PreferencesProvider>
        <CartProvider>
          <WhatsAppProvider>{children}</WhatsAppProvider>
        </CartProvider>
      </PreferencesProvider>
    </SessionProvider>
  );
}
