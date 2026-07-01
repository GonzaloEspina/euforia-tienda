import { NextResponse } from "next/server";
import {
  buildFinanciacionResult,
  fetchMercadoPagoCuotas,
} from "@/lib/mercadopago";
import type { TarjetaFinanciacion } from "@/types/financiacion";

export const dynamic = "force-dynamic";

const TARJETAS_VALIDAS = new Set<TarjetaFinanciacion>(["visa", "master", "amex"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const amount = Number(searchParams.get("amount"));
  const pasajeros = Math.max(1, Math.min(20, Number(searchParams.get("pasajeros") ?? 1)));
  const senaPorcentaje = Math.max(
    0,
    Math.min(100, Number(searchParams.get("sena") ?? 15))
  );
  const tarjetaParam = searchParams.get("tarjeta") ?? "visa";
  const tarjeta: TarjetaFinanciacion = TARJETAS_VALIDAS.has(
    tarjetaParam as TarjetaFinanciacion
  )
    ? (tarjetaParam as TarjetaFinanciacion)
    : "visa";

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { ok: false, message: "Monto inválido" },
      { status: 400 }
    );
  }

  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json(
      { ok: false, message: "Mercado Pago no configurado" },
      { status: 503 }
    );
  }

  const totalViaje = amount * pasajeros;
  const senaMonto = Math.round(totalViaje * (senaPorcentaje / 100));
  const montoFinanciacion = Math.max(0, totalViaje - senaMonto);
  const cuotas = await fetchMercadoPagoCuotas(montoFinanciacion, tarjeta);

  return NextResponse.json({
    ok: true,
    data: buildFinanciacionResult(
      amount,
      pasajeros,
      senaPorcentaje,
      cuotas,
      tarjeta
    ),
  });
}