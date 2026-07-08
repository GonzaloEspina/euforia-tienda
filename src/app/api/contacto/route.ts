import { NextResponse } from "next/server";
import type { ContactRequest } from "@/types/contacto";
import { submitContactToWhapify } from "@/lib/whapify";

function parseBody(raw: unknown): ContactRequest | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;

  const nombre = typeof data.nombre === "string" ? data.nombre.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const whatsapp = typeof data.whatsapp === "string" ? data.whatsapp.trim() : "";
  const mensaje = typeof data.mensaje === "string" ? data.mensaje.trim() : "";
  const pasajeros =
    typeof data.pasajeros === "string" && data.pasajeros.trim()
      ? data.pasajeros.trim()
      : undefined;
  const menores =
    typeof data.menores === "string" && data.menores.trim()
      ? data.menores.trim()
      : undefined;

  if (!nombre || !email || !whatsapp || !mensaje) return null;

  return { nombre, email, whatsapp, mensaje, pasajeros, menores };
}

function validate(data: ContactRequest): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return "Correo electrónico inválido";
  }
  const digits = data.whatsapp.replace(/\D/g, "");
  if (digits.length < 8) return "WhatsApp inválido";
  if (data.mensaje.length < 5) return "El mensaje es muy corto";
  return null;
}

export async function POST(request: Request) {
  try {
    const body = parseBody(await request.json());
    if (!body) {
      return NextResponse.json(
        { ok: false, message: "Completá todos los campos obligatorios" },
        { status: 400 }
      );
    }

    const validationError = validate(body);
    if (validationError) {
      return NextResponse.json({ ok: false, message: validationError }, { status: 400 });
    }

    const { contactId } = await submitContactToWhapify(body);

    return NextResponse.json({
      ok: true,
      contactId,
      message: "Consulta enviada correctamente",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al enviar la consulta";
    console.error("[contacto]", message);
    const status = message.includes("no configurado") ? 503 : 500;
    return NextResponse.json({ ok: false, message }, { status });
  }
}
