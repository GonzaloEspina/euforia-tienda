import { NextResponse } from "next/server";
import { getWooSiteUrl } from "@/lib/checkout-url";

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const body = await request.json();

  const upstream = await fetch(`${getWooSiteUrl()}/wp-json/euforia-puntos/v1/redeem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
