import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { CartProvider } from "@/context/CartContext";
import { WhatsAppProvider } from "@/context/WhatsAppContext";
import { PwaManager } from "@/components/PwaManager";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://viajaconeuforia.com"),
  title: {
    default: "Tienda Euforia Viajes",
    template: "%s | Euforia Viajes",
  },
  description:
    "Descubrí salidas grupales, viajes nacionales e internacionales. Reservá tu próxima aventura con Euforia Viajes.",
  manifest: "/tienda/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Euforia Tienda",
  },
  icons: {
    icon: [
      { url: "/tienda/icons/favicon.png", sizes: "150x150", type: "image/png" },
      { url: "/tienda/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/tienda/icons/icon-192.png",
    shortcut: "/tienda/icons/favicon.png",
  },
  openGraph: {
    title: "Tienda Euforia Viajes",
    description: "Tu próximo destino te está esperando",
    siteName: "Euforia Viajes",
    locale: "es_AR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#2a9fd4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={outfit.variable}>
      <body className="font-sans">
        <PreferencesProvider>
          <CartProvider>
            <WhatsAppProvider>
            <div className="min-h-dvh flex flex-col bg-hero-gradient">
              <Header />
              <main className="flex-1">{children}</main>
              <footer className="border-t border-sky-200/80 py-10 mt-auto bg-travel-bg">
                <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
                  <p className="text-lg font-semibold text-travel-ink">
                    Salidas grupales con asesoramiento real, desde Chubut y todo
                    el país.
                  </p>
                  <p className="text-base text-travel-ink-muted">
                    Reservá con respaldo de agencia habilitada ·{" "}
                    <span className="font-semibold text-travel-ink">
                      Euforia Viajes — Leg. 16816
                    </span>
                  </p>
                  <a
                    href="https://viajaconeuforia.com"
                    className="inline-block text-euforia-sky-dark font-medium hover:underline transition-colors"
                  >
                    Ir a viajaconeuforia.com
                  </a>
                </div>
              </footer>
            </div>
            <WhatsAppFloat />
            <PwaManager />
            </WhatsAppProvider>
          </CartProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
