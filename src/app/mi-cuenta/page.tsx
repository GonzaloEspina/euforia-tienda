"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchWpSession, getWpPuntosApiBase, type WpSession } from "@/lib/wp-session";
import {
  fetchWpRedemptions,
  formatRedemptionDate,
  redemptionStatusColor,
  type WpRedemption,
} from "@/lib/wp-redemptions";
import { WpLoginForm } from "@/components/WpLoginForm";
import { UserOrdersList } from "@/components/UserOrdersList";
import { AccountEditForm } from "@/components/AccountEditForm";

type Reward = {
  id: number;
  title: string;
  description?: string;
  benefit_label: string;
  points_cost: number;
  reward_type?: string;
  visual_type?: string;
  image_url?: string;
  icon?: string;
  badge_text?: string;
};

type RewardCategory = "all" | "discounts" | "merch";
type RewardSort = "points_asc" | "points_desc" | "name_asc" | "name_desc";

type HistoryEntry = {
  id: number;
  note?: string;
  type: string;
  points: number;
};

type AccountTab = "orders" | "points" | "profile";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? "No se pudo completar la acción.");
  }
  return data as T;
}

function normalizeDni(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 10) return null;
  return digits.replace(/^0+/, "") || "0";
}

export default function MiCuentaPage() {
  const [session, setSession] = useState<WpSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AccountTab>("orders");
  const [dniInput, setDniInput] = useState("");
  const [dni, setDni] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [redemptions, setRedemptions] = useState<WpRedemption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmReward, setConfirmReward] = useState<Reward | null>(null);

  const wpApi = getWpPuntosApiBase();

  const loadData = useCallback(
    async (normalizedDni: string, withRedemptions = false) => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const [b, r, h, red] = await Promise.all([
          fetchJson<{ balance: number }>(`${wpApi}/balance?dni=${normalizedDni}`, {
            credentials: "include",
          }),
          fetchJson<{ rewards: Reward[] }>(`${wpApi}/rewards`, {
            credentials: "include",
          }),
          fetchJson<{ history: HistoryEntry[] }>(`${wpApi}/history?dni=${normalizedDni}`, {
            credentials: "include",
          }),
          withRedemptions ? fetchWpRedemptions(normalizedDni) : Promise.resolve([] as WpRedemption[]),
        ]);
        setDni(normalizedDni);
        setBalance(b.balance);
        setRewards(r.rewards ?? []);
        setHistory(h.history ?? []);
        if (withRedemptions) setRedemptions(red);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al consultar tus puntos.");
      } finally {
        setLoading(false);
      }
    },
    [wpApi]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const data = await fetchWpSession();
        if (!cancelled) {
          setSession(data);
          if (data.logged_in && data.dni) {
            setDniInput(data.dni);
            await loadData(data.dni, true);
          }
        }
      } catch {
        if (!cancelled) setSession({ logged_in: false });
      } finally {
        if (!cancelled) setSessionLoading(false);
      }
    }

    void loadSession();
    return () => {
      cancelled = true;
    };
  }, [loadData]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const normalized = normalizeDni(dniInput);
    if (!normalized) {
      setError("Ingresá un DNI válido (6 a 10 dígitos).");
      return;
    }
    await loadData(normalized, session?.logged_in ?? false);
  };

  const redeem = async (rewardId: number) => {
    if (!dni) return;
    if (!session?.logged_in) {
      setError("Ingresá con tu cuenta para canjear premios.");
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      const result = await fetchJson<{ message?: string; coupon_code?: string }>(
        `${wpApi}/redeem`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ dni, reward_id: rewardId }),
        }
      );
      setConfirmReward(null);
      setSuccess(
        result.coupon_code
          ? `Canje exitoso. Tu cupón es: ${result.coupon_code}`
          : result.message ?? "Canje exitoso."
      );
      await loadData(dni, true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo canjear.");
    }
  };

  if (sessionLoading) {
    return <section className="max-w-5xl mx-auto px-4 py-10">Cargando cuenta...</section>;
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-travel-ink">Mi cuenta</h1>
        <p className="text-travel-ink-muted mt-1">
          Gestioná tu sesión, pedidos, puntos y canjes desde un solo lugar.
        </p>
      </div>

      {session?.logged_in ? (
        <>
          <div className="glass rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-travel-ink-muted">Sesión activa</p>
              <p className="font-semibold text-travel-ink">
                {session.name ?? "Viajero"} · {session.email}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {session.logout_url ? (
                <a
                  href={session.logout_url}
                  className="px-4 py-2 rounded-xl border border-sky-200 text-sm font-semibold text-travel-ink-muted hover:bg-sky-50"
                >
                  Salir
                </a>
              ) : null}
              <Link
                href="/"
                className="px-4 py-2 rounded-xl bg-euforia-sky-dark text-white text-sm font-semibold hover:bg-euforia-sky"
              >
                Ver salidas
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-sky-100">
            {(
              [
                ["orders", "Mis pedidos"],
                ["points", "Mis puntos"],
                ["profile", "Mis datos"],
              ] as const
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                  activeTab === tab
                    ? "border-euforia-sky-dark text-euforia-sky-dark"
                    : "border-transparent text-travel-ink-muted hover:text-travel-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "orders" ? (
            <UserOrdersList />
          ) : activeTab === "profile" ? (
            <AccountEditForm
              session={session}
              onUpdated={async (updated) => {
                setSession(updated);
                if (updated.dni) {
                  setDniInput(updated.dni);
                  await loadData(updated.dni, true);
                }
              }}
            />
          ) : (
            <PointsSection
              dniInput={dniInput}
              setDniInput={setDniInput}
              onSubmit={onSubmit}
              loading={loading}
              dni={dni}
              balance={balance}
              rewards={rewards}
              history={history}
              redemptions={redemptions}
              session={session}
              onRedeemClick={setConfirmReward}
            />
          )}
        </>
      ) : (
        <>
          <WpLoginForm
            onSuccess={async (data) => {
              setSession(data);
              setError(null);
              if (data.dni) {
                setDniInput(data.dni);
                await loadData(data.dni, true);
              }
            }}
          />
          <PointsSection
            dniInput={dniInput}
            setDniInput={setDniInput}
            onSubmit={onSubmit}
            loading={loading}
            dni={dni}
            balance={balance}
            rewards={rewards}
            history={history}
            redemptions={[]}
            session={session}
            onRedeemClick={setConfirmReward}
          />
        </>
      )}

      {confirmReward ? (
        <RedeemConfirmModal
          reward={confirmReward}
          onCancel={() => setConfirmReward(null)}
          onConfirm={() => redeem(confirmReward.id)}
        />
      ) : null}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
          {success}
        </div>
      )}
    </section>
  );
}

type PointsSectionProps = {
  dniInput: string;
  setDniInput: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
  dni: string | null;
  balance: number | null;
  rewards: Reward[];
  history: HistoryEntry[];
  redemptions: WpRedemption[];
  session: WpSession | null;
  onRedeemClick: (reward: Reward) => void;
};

function RedeemConfirmModal({
  reward,
  onCancel,
  onConfirm,
}: {
  reward: Reward;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="glass rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
        <h3 className="text-lg font-semibold text-travel-ink">Confirmar canje</h3>
        <p className="text-sm text-travel-ink-muted">
          Vas a canjear <strong className="text-travel-ink">{reward.title}</strong> por{" "}
          <strong className="text-travel-ink">{reward.points_cost} puntos</strong>.
        </p>
        <p className="text-sm text-amber-800 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
          Este canje no se puede deshacer una vez confirmado.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-sky-200 text-sm font-semibold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-euforia-sky-dark text-white text-sm font-semibold"
          >
            Confirmar canje
          </button>
        </div>
      </div>
    </div>
  );
}

function ScrollPanel({
  title,
  children,
  empty,
}: {
  title: string;
  children: ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="glass rounded-xl p-3 space-y-2">
      <h2 className="text-sm font-semibold text-travel-ink">{title}</h2>
      {empty ? (
        <p className="text-xs text-travel-ink-muted py-2">Todavía no hay registros.</p>
      ) : (
        <div className="max-h-52 overflow-y-auto pr-1 space-y-1.5">{children}</div>
      )}
    </div>
  );
}

function RedemptionRow({ item }: { item: WpRedemption }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-sky-100 bg-white/70 text-xs">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left hover:bg-sky-50/60"
      >
        <span className="min-w-0 flex-1">
          <span className="font-medium text-travel-ink block truncate">{item.reward_title}</span>
          <span className="text-travel-ink-muted">{formatRedemptionDate(item.created_at)}</span>
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${redemptionStatusColor(item.status)}`}
          >
            {item.status_label}
          </span>
          <span className="text-travel-ink-muted">{open ? "▲" : "▼"}</span>
        </span>
      </button>
      {open ? (
        <div className="px-2.5 pb-2 pt-0 space-y-0.5 text-travel-ink-muted border-t border-sky-50">
          <p>-{item.points_spent} puntos</p>
          {item.coupon_code ? <p>Cupón: {item.coupon_code}</p> : null}
          {item.expires_at ? (
            <p>Vence: {formatRedemptionDate(item.expires_at)}</p>
          ) : (
            <p>Sin vencimiento</p>
          )}
          {item.used_at ? <p>Usado el {formatRedemptionDate(item.used_at)}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function RewardVisual({ reward }: { reward: Reward }) {
  if (reward.visual_type === "image" && reward.image_url) {
    return (
      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-sky-50 mb-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={reward.image_url}
          alt={reward.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  const iconKind = reward.icon ?? "gift";
  const badge = reward.badge_text || (iconKind === "merch" ? "🎁" : "★");
  const gradient =
    iconKind === "percent"
      ? "from-euforia-sky-dark to-euforia-sky"
      : iconKind === "fixed"
        ? "from-emerald-600 to-emerald-400"
        : iconKind === "merch"
          ? "from-violet-600 to-violet-400"
          : "from-slate-500 to-slate-400";

  return (
    <div
      className={`w-full aspect-[4/3] rounded-lg mb-1.5 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center text-white font-bold`}
    >
      {iconKind === "percent" ? (
        <span className="text-2xl leading-none">%</span>
      ) : iconKind === "fixed" ? (
        <span className="text-xl leading-none">$</span>
      ) : null}
      <span className="text-sm mt-1 px-2 text-center leading-tight">{badge}</span>
    </div>
  );
}

function filterRewardsByCategory(rewards: Reward[], category: RewardCategory): Reward[] {
  if (category === "all") return rewards;
  if (category === "merch") {
    return rewards.filter((r) => r.reward_type === "merchandising");
  }
  return rewards.filter(
    (r) =>
      r.reward_type === "percent_discount" ||
      r.reward_type === "fixed_discount" ||
      !r.reward_type
  );
}

function sortRewards(rewards: Reward[], sort: RewardSort): Reward[] {
  const copy = [...rewards];
  switch (sort) {
    case "points_desc":
      return copy.sort((a, b) => b.points_cost - a.points_cost || a.title.localeCompare(b.title));
    case "name_asc":
      return copy.sort((a, b) => a.title.localeCompare(b.title, "es"));
    case "name_desc":
      return copy.sort((a, b) => b.title.localeCompare(a.title, "es"));
    case "points_asc":
    default:
      return copy.sort((a, b) => a.points_cost - b.points_cost || a.title.localeCompare(b.title));
  }
}

function RewardsSidebar({
  rewards,
  balance,
  session,
  loading,
  onRedeemClick,
}: {
  rewards: Reward[];
  balance: number;
  session: WpSession | null;
  loading: boolean;
  onRedeemClick: (reward: Reward) => void;
}) {
  const [category, setCategory] = useState<RewardCategory>("all");
  const [sort, setSort] = useState<RewardSort>("points_asc");

  const visible = useMemo(
    () => sortRewards(filterRewardsByCategory(rewards, category), sort),
    [rewards, category, sort]
  );

  return (
    <aside className="glass rounded-xl p-3 space-y-2 lg:sticky lg:top-4 lg:self-start">
      <h2 className="text-sm font-semibold text-travel-ink">Canjear puntos</h2>
      <div className="flex flex-wrap gap-1">
        {(
          [
            ["all", "Todos"],
            ["discounts", "Descuentos"],
            ["merch", "Merchandising"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={`text-xs font-semibold px-2 py-1.5 rounded-lg ${
              category === key
                ? "bg-euforia-sky-dark text-white"
                : "bg-sky-50 text-travel-ink-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="text-[11px] text-travel-ink-muted">Ordenar por</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as RewardSort)}
          className="mt-0.5 w-full rounded-lg border border-sky-200 px-2 py-1.5 text-xs bg-white"
        >
          <option value="points_asc">Puntos: menor a mayor</option>
          <option value="points_desc">Puntos: mayor a menor</option>
          <option value="name_asc">Nombre: A → Z</option>
          <option value="name_desc">Nombre: Z → A</option>
        </select>
      </label>
      <div className="max-h-[28rem] overflow-y-auto space-y-2 pr-0.5">
        {visible.length === 0 ? (
          <p className="text-xs text-travel-ink-muted py-2">No hay premios en esta categoría.</p>
        ) : (
          visible.map((reward) => {
            const enabled = session?.logged_in && balance >= reward.points_cost;
            return (
              <article
                key={reward.id}
                className="rounded-lg border border-sky-100 bg-white/70 p-2.5 space-y-1"
              >
                <RewardVisual reward={reward} />
                <p className="text-[10px] font-bold uppercase tracking-wide text-euforia-sky-dark leading-tight">
                  {reward.benefit_label}
                </p>
                <h3 className="font-semibold text-sm leading-snug">{reward.title}</h3>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-euforia-sky-dark">
                    {reward.points_cost} pts
                  </span>
                  <button
                    type="button"
                    onClick={() => onRedeemClick(reward)}
                    disabled={!enabled || loading}
                    className="px-2 py-1 rounded-lg bg-euforia-sky-dark text-white text-xs font-semibold disabled:opacity-50"
                  >
                    Canjear
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
      {!session?.logged_in ? (
        <p className="text-[11px] text-travel-ink-muted">Ingresá para canjear premios.</p>
      ) : null}
    </aside>
  );
}

function PointsSection({
  dniInput,
  setDniInput,
  onSubmit,
  loading,
  dni,
  balance,
  rewards,
  history,
  redemptions,
  session,
  onRedeemClick,
}: PointsSectionProps) {
  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} className="glass rounded-xl p-3 space-y-2">
        <h2 className="text-sm font-semibold">Mis puntos Euforia</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={dniInput}
            onChange={(e) => setDniInput(e.target.value)}
            placeholder="Ingresá tu DNI"
            className="flex-1 rounded-lg border border-sky-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-2 rounded-lg bg-euforia-sky-dark text-white text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "..." : "Consultar"}
          </button>
        </div>
      </form>

      {dni && balance !== null && (
        <>
          <div className="rounded-xl bg-gradient-to-r from-euforia-sky-dark to-euforia-sky px-4 py-3 text-white flex items-center justify-between gap-3">
            <div>
              <p className="text-xs opacity-90">DNI {dni}</p>
              <p className="text-2xl font-black leading-tight">{balance}</p>
              <p className="text-xs opacity-90">puntos disponibles</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_17rem] gap-3 items-start">
            <div className="space-y-3 min-w-0">
              {session?.logged_in ? (
                <ScrollPanel title="Mis canjes" empty={redemptions.length === 0}>
                  {redemptions.map((item) => (
                    <RedemptionRow key={item.id} item={item} />
                  ))}
                </ScrollPanel>
              ) : null}

              <ScrollPanel title="Historial de movimientos" empty={history.length === 0}>
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-2 text-xs py-1 border-b border-sky-50 last:border-0"
                  >
                    <span className="truncate text-travel-ink">{entry.note || entry.type}</span>
                    <span
                      className={
                        entry.points >= 0
                          ? "text-emerald-700 font-semibold shrink-0"
                          : "text-red-700 font-semibold shrink-0"
                      }
                    >
                      {entry.points > 0 ? "+" : ""}
                      {entry.points}
                    </span>
                  </div>
                ))}
              </ScrollPanel>
            </div>

            <RewardsSidebar
              rewards={rewards}
              balance={balance}
              session={session}
              loading={loading}
              onRedeemClick={onRedeemClick}
            />
          </div>
        </>
      )}
    </div>
  );
}
