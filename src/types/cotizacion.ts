export interface PasajeroCotizacion {
  nombre: string;
  edad: string;
  esMenor: boolean;
}

export const EDAD_MAYORIA = 18;
export const EDAD_MAXIMA = 100;

export function isPasajeroMenor(edad: string | number): boolean {
  const num = Number(edad);
  return Number.isFinite(num) && num >= 0 && num < EDAD_MAYORIA;
}
export interface NecesidadesEspeciales {
  movilidadReducida: boolean;
  sillaRuedas: boolean;
  menuCeliacos: boolean;
  menuVegetariano: boolean;
  menuVegano: boolean;
  asistenciaMedica: boolean;
  habitacionAdaptada: boolean;
  mascotas: boolean;
  otros: string;
}

export interface ContactoCotizacion {
  nombre: string;
  apellido: string;
  email: string;
  whatsapp: string;
  ciudad: string;
}

export interface CotizacionFormData {
  cantidadPasajeros: number;
  pasajeros: PasajeroCotizacion[];
  necesidades: NecesidadesEspeciales;
  transportePreferido: string[];
  tipoHabitacion: string;
  fechasFlexibles: boolean;
  comentarios: string;
  destinoSueno: string;
  contacto: ContactoCotizacion;
}

export interface CotizacionRequest extends CotizacionFormData {
  salidaId: number;
  salidaSlug: string;
  salidaTitulo: string;
  salidaFecha?: string;
  salidaDestino?: string;
}

export const TRANSPORTE_OPCIONES = [
  "Avión",
  "Bus",
  "Tren",
  "Crucero",
  "Transporte propio",
  "Sin preferencia",
] as const;

export const HABITACION_OPCIONES = [
  "Individual",
  "Doble",
  "Triple",
  "Cuádruple",
  "Compartida",
  "Sin preferencia",
] as const;

export const NECESIDADES_LABELS: Record<keyof Omit<NecesidadesEspeciales, "otros">, string> = {
  movilidadReducida: "Movilidad reducida",
  sillaRuedas: "Silla de ruedas",
  menuCeliacos: "Menú sin TACC / celíacos",
  menuVegetariano: "Menú vegetariano",
  menuVegano: "Menú vegano",
  asistenciaMedica: "Asistencia médica especial",
  habitacionAdaptada: "Habitación adaptada",
  mascotas: "Viaja con mascota",
};

export function emptyPasajero(): PasajeroCotizacion {
  return { nombre: "", edad: "", esMenor: false };
}

export function emptyNecesidades(): NecesidadesEspeciales {
  return {
    movilidadReducida: false,
    sillaRuedas: false,
    menuCeliacos: false,
    menuVegetariano: false,
    menuVegano: false,
    asistenciaMedica: false,
    habitacionAdaptada: false,
    mascotas: false,
    otros: "",
  };
}

export function initialCotizacionForm(cantidad = 1): CotizacionFormData {
  return {
    cantidadPasajeros: cantidad,
    pasajeros: Array.from({ length: cantidad }, () => emptyPasajero()),
    necesidades: emptyNecesidades(),
    transportePreferido: [],
    tipoHabitacion: "Sin preferencia",
    fechasFlexibles: false,
    comentarios: "",
    destinoSueno: "",
    contacto: {
      nombre: "",
      apellido: "",
      email: "",
      whatsapp: "",
      ciudad: "",
    },
  };
}
