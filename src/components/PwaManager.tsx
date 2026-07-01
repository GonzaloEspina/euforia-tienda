"use client";

import { useEffect, useState } from "react";
import { apiUrl, BASE_PATH } from "@/lib/config";

const INSTALL_DISMISS_KEY = "euforia-pwa-install-dismissed";
const CATALOG_VERSION_KEY = "euforia-catalog-version";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaManager() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    setIsStandalone(standalone);

    const dismissed = localStorage.getItem(INSTALL_DISMISS_KEY);
    if (!standalone && !dismissed) {
      const handler = (e: Event) => {
        e.preventDefault();
        setInstallEvent(e as BeforeInstallPromptEvent);
        setShowInstall(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${BASE_PATH}/sw.js`).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch(apiUrl("/api/catalog/version"));
        if (!res.ok) return;
        const { version } = await res.json();
        const stored = localStorage.getItem(CATALOG_VERSION_KEY);
        if (stored && stored !== version) {
          setShowUpdate(true);
        }
        localStorage.setItem(CATALOG_VERSION_KEY, version);
      } catch {
        // offline
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") setShowInstall(false);
    setInstallEvent(null);
  };

  const dismissInstall = () => {
    localStorage.setItem(INSTALL_DISMISS_KEY, "1");
    setShowInstall(false);
  };

  const handleUpdate = () => {
    window.location.reload();
  };

  if (isStandalone) return null;

  return (
    <>
      {showInstall && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[100] animate-slide-up">
          <div className="glass rounded-2xl p-4 shadow-glow border border-euforia-sky/30">
            <div className="flex gap-3">
              <div className="text-2xl">📲</div>
              <div className="flex-1">
                <p className="font-semibold text-base mb-1">
                  Instalá la tienda Euforia
                </p>
                <p className="text-sm text-euforia-muted mb-3">
                  Accedé más rápido al catálogo de viajes desde tu pantalla de
                  inicio.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleInstall}
                    className="flex-1 py-2.5 rounded-xl bg-euforia-sky text-euforia-darker text-sm font-bold"
                  >
                    Instalar
                  </button>
                  <button
                    type="button"
                    onClick={dismissInstall}
                    className="px-3 py-2.5 rounded-xl text-sm text-euforia-muted hover:text-white"
                  >
                    Ahora no
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpdate && (
        <div className="fixed top-[5.5rem] left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-[100] animate-slide-up">
          <div className="glass rounded-2xl p-4 border border-euforia-sky/30 flex items-center gap-3">
            <span className="text-xl">🔄</span>
            <div className="flex-1">
              <p className="text-base font-semibold">Nuevo catálogo disponible</p>
              <p className="text-sm text-euforia-muted">
                Hay salidas actualizadas. Actualizá para ver lo último.
              </p>
            </div>
            <button
              type="button"
              onClick={handleUpdate}
              className="shrink-0 px-3.5 py-2.5 rounded-xl bg-euforia-sky text-euforia-darker text-sm font-bold"
            >
              Actualizar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
