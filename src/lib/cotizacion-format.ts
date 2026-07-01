import type { CotizacionRequest } from "@/types/cotizacion";
import { NECESIDADES_LABELS } from "@/types/cotizacion";

const TAG_WEB = "Cotización desde Web";

export function getCotizacionWebTag(): string {
  return TAG_WEB;
}

export function getSalidaTagName(titulo: string): string {
  return titulo.trim().slice(0, 80);
}

export function formatCotizacionForAgent(data: CotizacionRequest): string {
  const lines: string[] = [
    "🧳 NUEVA COTIZACIÓN DESDE LA WEB",
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `📍 Salida: ${data.salidaTitulo}`,
  ];

  if (data.salidaSlug === "personalizada") {
    lines[2] = "🧳 COTIZACIÓN A MEDIDA DESDE LA WEB";
    if (data.destinoSueno?.trim()) {
      lines.push(`✨ Destino soñado: ${data.destinoSueno.trim()}`);
    }
  }

  if (data.salidaFecha) lines.push(`📅 Fecha salida: ${data.salidaFecha}`);
  if (data.salidaDestino) lines.push(`🌍 Destino: ${data.salidaDestino}`);
  lines.push(`👥 Cantidad de pasajeros: ${data.cantidadPasajeros}`);
  lines.push("");

  lines.push("── PASAJEROS ──");
  data.pasajeros.forEach((p, i) => {
    const menor = p.esMenor ? " (menor)" : "";
    lines.push(
      `${i + 1}. ${p.nombre || "Sin nombre"} — ${p.edad || "?"} años${menor}`
    );
  });
  lines.push("");

  const necesidades = (
    Object.keys(NECESIDADES_LABELS) as (keyof typeof NECESIDADES_LABELS)[]
  ).filter((k) => data.necesidades[k]);

  lines.push("── NECESIDADES ESPECIALES ──");
  if (necesidades.length) {
    necesidades.forEach((k) => lines.push(`• ${NECESIDADES_LABELS[k]}`));
  } else {
    lines.push("• Ninguna indicada");
  }
  if (data.necesidades.otros.trim()) {
    lines.push(`• Otros: ${data.necesidades.otros.trim()}`);
  }
  lines.push("");

  lines.push("── PREFERENCIAS ──");
  lines.push(
    `🚌 Transporte: ${
      data.transportePreferido.length
        ? data.transportePreferido.join(", ")
        : "Sin preferencia"
    }`
  );
  lines.push(`🛏️ Habitación: ${data.tipoHabitacion || "Sin preferencia"}`);
  lines.push(
    `📆 Fechas flexibles: ${data.fechasFlexibles ? "Sí" : "No"}`
  );

  if (data.comentarios.trim()) {
    lines.push("");
    lines.push("── COMENTARIOS ──");
    lines.push(data.comentarios.trim());
  }

  lines.push("");
  lines.push("── CONTACTO ──");
  lines.push(
    `👤 ${data.contacto.nombre} ${data.contacto.apellido}`.trim()
  );
  lines.push(`📱 WhatsApp: ${data.contacto.whatsapp}`);
  if (data.contacto.email) lines.push(`✉️ Email: ${data.contacto.email}`);
  if (data.contacto.ciudad) lines.push(`📍 Ciudad: ${data.contacto.ciudad}`);

  return lines.join("\n");
}
