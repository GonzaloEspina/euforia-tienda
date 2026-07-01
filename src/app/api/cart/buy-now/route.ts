import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { appendWooCartHeaders } from "@/lib/cart-proxy";
import { getCheckoutUrl } from "@/lib/checkout-url";
import { getWooBaseUrl } from "@/lib/woocommerce";

export const dynamic = "force-dynamic";

async function classicAddToCart(
  productId: number,
  cookieHeader: string
): Promise<Response> {
  return fetch(`${getWooBaseUrl()}/?wc-ajax=add_to_cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: new URLSearchParams({
      product_id: String(productId),
      quantity: "1",
    }).toString(),
    redirect: "manual",
  });
}

async function classicApplyCoupon(
  code: string,
  cookieHeader: string
): Promise<Response> {
  return fetch(`${getWooBaseUrl()}/?wc-ajax=apply_coupon`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: new URLSearchParams({ coupon_code: code }).toString(),
    redirect: "manual",
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: number;
      coupon?: string;
    };

    if (!body.id) {
      return NextResponse.json(
        { message: "Falta id de producto" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const addResponse = await classicAddToCart(body.id, cookieHeader);

    if (!addResponse.ok) {
      const errorText = await addResponse.text();
      let message = "No se pudo agregar el producto";
      try {
        const parsed = JSON.parse(errorText) as {
          error?: boolean;
          message?: string;
        };
        if (parsed.message) message = parsed.message;
      } catch {
        if (errorText) message = errorText;
      }
      return NextResponse.json({ message }, { status: addResponse.status });
    }

    let couponApplied = false;
    const couponCode = body.coupon?.trim();

    if (couponCode) {
      const couponResponse = await classicApplyCoupon(couponCode, cookieHeader);
      couponApplied = couponResponse.ok;
    }

    const nextRes = NextResponse.json({
      ok: true,
      checkoutUrl: getCheckoutUrl(),
      couponApplied: couponCode ? couponApplied : undefined,
      couponCode: couponApplied ? undefined : couponCode,
    });
    appendWooCartHeaders(addResponse, nextRes);
    return nextRes;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al iniciar la compra";
    return NextResponse.json({ message }, { status: 500 });
  }
}
