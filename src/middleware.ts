import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const VERCEL_HOST = "euforia-tienda.vercel.app";
const CANONICAL_HOST = "viajaconeuforia.com";

export function middleware(request: NextRequest) {
  if (request.nextUrl.hostname !== VERCEL_HOST) {
    return NextResponse.next();
  }

  const target = request.nextUrl.clone();
  target.hostname = CANONICAL_HOST;
  target.protocol = "https:";
  target.port = "";

  return NextResponse.redirect(target, 308);
}

export const config = {
  matcher: "/:path*",
};
