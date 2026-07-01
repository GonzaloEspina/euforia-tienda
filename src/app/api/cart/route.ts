import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { proxyCartRequest } from "@/lib/woocommerce";
import type { CartData } from "@/types/salida";

export const dynamic = "force-dynamic";

function mapCart(raw: Record<string, unknown>): CartData {
  const items = (raw.items as Record<string, unknown>[]) ?? [];
  const totals = (raw.totals as Record<string, unknown>) ?? {};

  return {
    items: items.map((item) => ({
      key: String(item.key ?? ""),
      id: Number(item.id),
      quantity: Number(item.quantity),
      name: String(item.name ?? ""),
      permalink: String((item as { permalink?: string }).permalink ?? ""),
      images: ((item.images as { src: string; alt?: string }[]) ?? []).map((img) => ({
        src: img.src,
        alt: img.alt,
      })),
      prices: item.prices as CartData["items"][0]["prices"],
      totals: item.totals as CartData["items"][0]["totals"],
    })),
    itemsCount: Number(raw.items_count ?? items.length),
    totals: {
      total_items: String(totals.total_items ?? "0"),
      total_price: String(totals.total_price ?? "0"),
      currency_code: String(totals.currency_code ?? "ARS"),
      currency_symbol: String(totals.currency_symbol ?? "$"),
    },
  };
}

async function forwardCart(
  path: string,
  init: RequestInit = {}
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const response = await proxyCartRequest(path, init, cookieHeader);
  const text = await response.text();

  const nextRes = new NextResponse(text, { status: response.status });
  const setCookies = response.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookies) {
    nextRes.headers.append("Set-Cookie", cookie);
  }

  return nextRes;
}

export async function GET() {
  try {
    const res = await forwardCart("/wp-json/wc/store/v1/cart", { method: "GET" });
    const data = await res.json();
    return NextResponse.json(mapCart(data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de carrito";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
