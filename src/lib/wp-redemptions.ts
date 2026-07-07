import { getWpPuntosApiBase } from "@/lib/wp-session";

export type WpRedemption = {
  id: number;
  reward_title: string;
  reward_type?: string;
  points_spent: number;
  status: "pending" | "used" | "expired" | "completed";
  status_label: string;
  coupon_code?: string | null;
  created_at?: string | null;
  expires_at?: string | null;
  used_at?: string | null;
};

export async function fetchWpRedemptions(dni: string): Promise<WpRedemption[]> {
  const res = await fetch(`${getWpPuntosApiBase()}/redemptions?dni=${encodeURIComponent(dni)}`, {
    credentials: "include",
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    redemptions?: WpRedemption[];
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "No se pudieron cargar los canjes.");
  }
  return data.redemptions ?? [];
}

export function formatRedemptionDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function redemptionStatusColor(status: string): string {
  switch (status) {
    case "used":
    case "completed":
      return "bg-emerald-100 text-emerald-800";
    case "expired":
      return "bg-slate-200 text-slate-700";
    case "pending":
    default:
      return "bg-sky-100 text-sky-800";
  }
}
