import {
  EDAD_MAXIMA,
  EDAD_MAYORIA,
  type CotizacionRequest,
  type PasajeroCotizacion,
} from "@/types/cotizacion";

export function validatePasajero(
  pasajero: PasajeroCotizacion,
  index: number
): string | null {
  if (!pasajero.nombre?.trim()) {
    return `Nombre del pasajero ${index + 1} requerido`;
  }
  if (!String(pasajero.edad).trim()) {
    return `La edad del pasajero ${index + 1} es requerida`;
  }
  const edad = Number(pasajero.edad);
  if (!Number.isFinite(edad) || edad < 0 || edad > EDAD_MAXIMA) {
    return `La edad del pasajero ${index + 1} debe estar entre 0 y ${EDAD_MAXIMA}`;
  }
  return null;
}

export function validatePasajeros(pasajeros: PasajeroCotizacion[]): string | null {
  for (let i = 0; i < pasajeros.length; i++) {
    const error = validatePasajero(pasajeros[i], i);
    if (error) return error;
  }

  const tieneMayorDeEdad = pasajeros.some((p) => {
    const edad = Number(p.edad);
    return Number.isFinite(edad) && edad >= EDAD_MAYORIA;
  });

  if (!tieneMayorDeEdad) {
    return `Al menos un pasajero debe ser mayor de edad (${EDAD_MAYORIA} años o más)`;
  }

  return null;
}

export function validateCotizacion(
  data: Partial<CotizacionRequest>
): string | null {
  if (!data.salidaSlug || !data.salidaTitulo?.trim()) {
    return "Datos de la salida incompletos";
  }

  if (data.salidaSlug !== "personalizada" && !data.salidaId) {
    return "Datos de la salida incompletos";
  }

  if (!data.cantidadPasajeros || data.cantidadPasajeros < 1) {
    return "Indicá al menos un pasajero";
  }

  if (!data.pasajeros?.length) {
    return "Completá los datos de los pasajeros";
  }

  const pasajerosError = validatePasajeros(data.pasajeros);
  if (pasajerosError) return pasajerosError;

  if (data.salidaSlug === "personalizada") {
    if (!data.destinoSueno?.trim()) {
      return "Contanos tu destino soñado";
    }
  }

  const c = data.contacto;
  if (!c?.nombre?.trim()) return "Tu nombre es requerido";
  if (!c.whatsapp?.trim()) return "Tu número de WhatsApp es requerido";

  const digits = c.whatsapp.replace(/\D/g, "");
  if (digits.length < 8) {
    return "Ingresá un número de WhatsApp válido (con código de área)";
  }

  if (c.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) {
    return "Email inválido";
  }

  return null;
}

export function parseCotizacionBody(
  body: unknown
): Partial<CotizacionRequest> | null {
  if (!body || typeof body !== "object") return null;
  return body as Partial<CotizacionRequest>;
}

export function assertCotizacionRequest(
  data: Partial<CotizacionRequest>
): CotizacionRequest {
  const error = validateCotizacion(data);
  if (error) throw new Error(error);

  return data as CotizacionRequest;
}
