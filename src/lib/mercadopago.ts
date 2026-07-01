import type { TarjetaFinanciacion } from "@/types/financiacion";
import { getTarjetaFinanciacionOption } from "@/types/financiacion";

export interface CuotaFinanciacion {
  installments: number;
  installmentAmount: number;
  totalAmount: number;
  interestPercent: number;
}

export interface FinanciacionResult {
  /** Total del viaje (precio base × pasajeros). */
  amount: number;
  /** Saldo financiado en cuotas (total − seña). */
  montoFinanciacion: number;
  cuotas: CuotaFinanciacion[];
  senaPorcentaje: number;
  senaMonto: number;
  pasajeros: number;
  tarjeta: TarjetaFinanciacion;
}

const CUOTAS_A_MOSTRAR = [2, 3, 6, 9, 12, 18] as const;

interface MpPayerCost {
  installments: number;
  installment_rate: number;
  installment_amount: number;
  total_amount: number;
}

interface MpInstallmentsResponse {
  payer_costs?: MpPayerCost[];
}

function getAccessToken(): string | undefined {
  return process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() || undefined;
}

function interestPercent(baseAmount: number, totalAmount: number): number {
  if (baseAmount <= 0 || totalAmount <= baseAmount) return 0;
  return Math.round(((totalAmount - baseAmount) / baseAmount) * 10000) / 100;
}

function parsePayerCosts(
  data: MpInstallmentsResponse[] | MpInstallmentsResponse
): MpPayerCost[] {
  const payerCosts = Array.isArray(data)
    ? data[0]?.payer_costs
    : data.payer_costs;
  return payerCosts ?? [];
}

function mapCuotas(
  amount: number,
  payerCosts: MpPayerCost[]
): CuotaFinanciacion[] {
  const byInstallments = new Map(
    payerCosts.map((cost) => [cost.installments, cost])
  );

  return CUOTAS_A_MOSTRAR.flatMap((n) => {
    const cost = byInstallments.get(n);
    if (!cost || cost.installments <= 1) return [];

    const rate =
      cost.installment_rate > 0
        ? cost.installment_rate
        : interestPercent(amount, cost.total_amount);

    return [
      {
        installments: cost.installments,
        installmentAmount: cost.installment_amount,
        totalAmount: cost.total_amount,
        interestPercent: rate,
      },
    ];
  });
}

async function requestInstallments(
  token: string,
  amount: number,
  paymentMethodId: string,
  bin: string
): Promise<MpPayerCost[] | null> {
  const url = new URL(
    "https://api.mercadopago.com/v1/payment_methods/installments"
  );
  url.searchParams.set("amount", String(Math.round(amount)));
  url.searchParams.set("payment_method_id", paymentMethodId);
  url.searchParams.set("bin", bin);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    const body = await response.text();
    console.warn(
      `[mercadopago] installments ${paymentMethodId}/${bin}`,
      response.status,
      body
    );
    return null;
  }

  const data = (await response.json()) as
    | MpInstallmentsResponse[]
    | MpInstallmentsResponse;
  const payerCosts = parsePayerCosts(data);
  return payerCosts.length > 0 ? payerCosts : null;
}

export async function fetchMercadoPagoCuotas(
  amount: number,
  tarjeta: TarjetaFinanciacion = "visa"
): Promise<CuotaFinanciacion[]> {
  const token = getAccessToken();
  if (!token || !Number.isFinite(amount) || amount <= 0) return [];

  const option = getTarjetaFinanciacionOption(tarjeta);

  for (const bin of option.bins) {
    const payerCosts = await requestInstallments(
      token,
      amount,
      option.paymentMethodId,
      bin
    );
    if (payerCosts) {
      return mapCuotas(amount, payerCosts);
    }
  }

  console.error(
    `[mercadopago] installments: no se pudieron obtener cuotas para ${tarjeta}`
  );
  return [];
}

export function buildFinanciacionResult(
  amountPerPerson: number,
  pasajeros: number,
  senaPorcentaje: number,
  cuotas: CuotaFinanciacion[],
  tarjeta: TarjetaFinanciacion = "visa"
): FinanciacionResult {
  const amount = amountPerPerson * pasajeros;
  const senaMonto = Math.round(amount * (senaPorcentaje / 100));
  const montoFinanciacion = Math.max(0, amount - senaMonto);

  return {
    amount,
    montoFinanciacion,
    cuotas,
    senaPorcentaje,
    senaMonto,
    pasajeros,
    tarjeta,
  };
}
