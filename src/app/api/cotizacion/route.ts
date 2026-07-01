import { NextResponse } from "next/server";
import {
  assertCotizacionRequest,
  parseCotizacionBody,
  validateCotizacion,
} from "@/lib/cotizacion-validate";
import { submitCotizacionToWhapify } from "@/lib/whapify";

export async function POST(request: Request) {
  try {
    const body = parseCotizacionBody(await request.json());
    if (!body) {
      return NextResponse.json(
        { ok: false, message: "Cuerpo de solicitud inválido" },
        { status: 400 }
      );
    }

    const validationError = validateCotizacion(body);
    if (validationError) {
      return NextResponse.json(
        { ok: false, message: validationError },
        { status: 400 }
      );
    }

    const data = assertCotizacionRequest(body);
    const { contactId } = await submitCotizacionToWhapify(data);

    return NextResponse.json({
      ok: true,
      contactId,
      message: "Cotización enviada correctamente",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al enviar la cotización";

    console.error("[cotizacion]", message);

    const status = message.includes("no configurado") ? 503 : 500;
    return NextResponse.json({ ok: false, message }, { status });
  }
}
