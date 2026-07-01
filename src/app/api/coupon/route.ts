import { NextResponse } from "next/server";

const WOO_URL =
  process.env.NEXT_PUBLIC_WOO_URL ?? "https://viajaconeuforia.com";

interface WooCoupon {
  id: number;
  code: string;
  amount: string;
  discount_type: "percent" | "fixed_cart" | "fixed_product";
  date_expires: string | null;
  usage_limit: number | null;
  usage_count: number;
}

function authHeader(): string | undefined {
  const key = process.env.WOO_CONSUMER_KEY;
  const secret = process.env.WOO_CONSUMER_SECRET;
  if (!key || !secret) return undefined;
  return `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
}

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.trim();
  if (!code) {
    return NextResponse.json(
      { valid: false, error: "Ingresá un código de cupón" },
      { status: 400 }
    );
  }

  const auth = authHeader();
  if (!auth) {
    return NextResponse.json(
      { valid: false, error: "Validación de cupones no configurada" },
      { status: 503 }
    );
  }

  try {
    const base = WOO_URL.replace(/\/$/, "");
    const response = await fetch(
      `${base}/wp-json/wc/v3/coupons?code=${encodeURIComponent(code)}`,
      {
        headers: { Authorization: auth },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { valid: false, error: "No se pudo validar el cupón" },
        { status: 502 }
      );
    }

    const coupons = (await response.json()) as WooCoupon[];
    const coupon = coupons[0];

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: "Cupón no válido o vencido" },
        { status: 404 }
      );
    }

    if (coupon.date_expires) {
      const expires = new Date(coupon.date_expires);
      if (!isNaN(expires.getTime()) && expires < new Date()) {
        return NextResponse.json(
          { valid: false, error: "Este cupón ya venció" },
          { status: 410 }
        );
      }
    }

    if (
      coupon.usage_limit != null &&
      coupon.usage_count >= coupon.usage_limit
    ) {
      return NextResponse.json(
        { valid: false, error: "Este cupón alcanzó su límite de uso" },
        { status: 410 }
      );
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      amount: coupon.amount,
    });
  } catch {
    return NextResponse.json(
      { valid: false, error: "Error al validar el cupón" },
      { status: 500 }
    );
  }
}
