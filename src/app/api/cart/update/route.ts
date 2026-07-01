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

async function cartPost(body: unknown, path: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const response = await proxyCartRequest(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    cookieHeader
  );

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      { message: data.message ?? "Error" },
      { status: response.status }
    );
  }

  const nextRes = NextResponse.json(mapCart(data));
  const setCookies = response.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookies) {
    nextRes.headers.append("Set-Cookie", cookie);
  }
  return nextRes;
}

export async function POST(request: Request) {
  const { key, quantity } = (await request.json()) as {
    key: string;
    quantity: number;
  };
  if (!key) return NextResponse.json({ message: "Falta key" }, { status: 400 });
  return cartPost(
    { key, quantity },
    "/wp-json/wc/store/v1/cart/update-item"
  );
}
