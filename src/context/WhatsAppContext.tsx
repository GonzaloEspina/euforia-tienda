"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface WhatsAppContextValue {
  salidaTitulo: string | null;
  setSalidaTitulo: (titulo: string | null) => void;
}

const WhatsAppContext = createContext<WhatsAppContextValue | null>(null);

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [salidaTitulo, setSalidaTitulo] = useState<string | null>(null);

  return (
    <WhatsAppContext.Provider value={{ salidaTitulo, setSalidaTitulo }}>
      {children}
    </WhatsAppContext.Provider>
  );
}

export function useWhatsAppSalidaTitulo(): string | null {
  return useContext(WhatsAppContext)?.salidaTitulo ?? null;
}

/** Registra el título de la salida activa para el mensaje de WhatsApp. */
export function useRegisterWhatsAppSalida(titulo: string | null) {
  const setSalidaTitulo = useContext(WhatsAppContext)?.setSalidaTitulo;

  useEffect(() => {
    if (!setSalidaTitulo) return;
    setSalidaTitulo(titulo);
    return () => setSalidaTitulo(null);
  }, [titulo, setSalidaTitulo]);
}
