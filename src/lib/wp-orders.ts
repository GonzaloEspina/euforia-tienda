import { getWpPuntosApiBase } from "@/lib/wp-session";

export type WpOrderItem = {
  name: string;
  quantity: number;
  total: string;
  image?: string | null;
};

export type WpOrderBilling = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
};

export type WpOrder = {
  id: number;
  number: string;
  status: string;
  status_label: string;
  date: string | null;
  total: string;
  currency: string;
  currency_symbol: string;
  item_count: number;
  items: WpOrderItem[];
  payment_method?: string;
  billing: WpOrderBilling;
};

export type WpOrdersResponse = {
  orders: WpOrder[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

export async function fetchWpOrders(page = 1): Promise<WpOrdersResponse> {
  const res = await fetch(
    `${getWpPuntosApiBase()}/orders?page=${page}&per_page=20`,
    { credentials: "include", cache: "no-store" }
  );
  const data = (await res.json().catch(() => ({}))) as WpOrdersResponse & {
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "No se pudieron cargar los pedidos.");
  }
  return data;
}

export function formatOrderDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatOrderTotal(order: WpOrder): string {
  const amount = Number.parseFloat(order.total);
  const formatted = Number.isFinite(amount)
    ? amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })
    : order.total;
  return `${order.currency_symbol}${formatted}`;
}

export function orderStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-800";
    case "processing":
      return "bg-sky-100 text-sky-800";
    case "on-hold":
      return "bg-amber-100 text-amber-800";
    case "cancelled":
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}
