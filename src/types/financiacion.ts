export type TarjetaFinanciacion = "visa" | "master" | "amex";

export interface TarjetaFinanciacionOption {
  id: TarjetaFinanciacion;
  label: string;
  paymentMethodId: string;
  /** BINs de referencia Argentina; se prueban en orden hasta obtener cuotas. */
  bins: string[];
}

/** BINs de referencia Argentina para estimar cuotas sin tarjeta del cliente. */
export const TARJETA_FINANCIACION_OPTIONS: TarjetaFinanciacionOption[] = [
  {
    id: "visa",
    label: "Visa",
    paymentMethodId: "visa",
    bins: ["450995", "454642"],
  },
  {
    id: "master",
    label: "Mastercard",
    paymentMethodId: "master",
    bins: ["550568", "531002", "516477"],
  },
  {
    id: "amex",
    label: "American Express",
    paymentMethodId: "amex",
    bins: ["371595", "376411"],
  },
];

export function getTarjetaFinanciacionOption(
  tarjeta: TarjetaFinanciacion
): TarjetaFinanciacionOption {
  return (
    TARJETA_FINANCIACION_OPTIONS.find((t) => t.id === tarjeta) ??
    TARJETA_FINANCIACION_OPTIONS[0]
  );
}
