import { NextResponse } from "next/server";
import { fetchCatalog } from "@/lib/woocommerce";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { version, fetchedAt, salidas } = await fetchCatalog();
    return NextResponse.json({
      version,
      fetchedAt,
      count: salidas.length,
    });
  } catch {
    return NextResponse.json({ version: "unknown", fetchedAt: null, count: 0 });
  }
}
