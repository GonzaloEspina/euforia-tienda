import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_HOST = "viajaconeuforia.com";
const VERCEL_HOST = "euforia-tienda.vercel.app";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host");

  // Fuerza dominio canónico para evitar sesiones separadas por host.
  if (host === VERCEL_HOST) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};

