import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { PromoBanner } from "@/components/PromoBanner";
import { AppProviders } from "@/components/AppProviders";
import { PwaManager } from "@/components/PwaManager";
import { WooSessionBootstrap } from "@/components/WooSessionBootstrap";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://viajaconeuforia.com"),
  title: {
    default: "Euforia Viajes — Paquetes de Viaje",
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
        <AppProviders>
            <div className="min-h-dvh flex flex-col bg-travel-bg">
              <Header />
              <PromoBanner />
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
                  <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-travel-ink-muted pt-2">
                    <a href="/tienda/quienes-somos" className="hover:text-euforia-sky-dark hover:underline">
                      Quiénes somos
                    </a>
                    <a href="/tienda/datos-bancarios" className="hover:text-euforia-sky-dark hover:underline">
                      Datos bancarios
                    </a>
                    <a
                      href="/tienda/condiciones-generales"
                      className="hover:text-euforia-sky-dark hover:underline"
                    >
                      Condiciones generales
                    </a>
                    <a href="/tienda/blog" className="hover:text-euforia-sky-dark hover:underline">
                      Blog
                    </a>
                  </nav>
                </div>
              </footer>
            </div>
            <WhatsAppFloat />
            <PwaManager />
            <WooSessionBootstrap />
        </AppProviders>
      </body>
    </html>
  );
}
