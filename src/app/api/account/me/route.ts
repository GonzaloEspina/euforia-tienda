import { NextResponse } from "next/server";
import { getWooSiteUrl } from "@/lib/checkout-url";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const upstream = await fetch(`${getWooSiteUrl()}/wp-json/euforia-puntos/v1/me`, {
    headers: { cookie },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
