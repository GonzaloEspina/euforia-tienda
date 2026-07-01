import { NextResponse } from "next/server";
import { fetchCatalog } from "@/lib/woocommerce";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET() {
  try {
    const catalog = await fetchCatalog();
    return NextResponse.json(catalog, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-Catalog-Version": catalog.version,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar catálogo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
