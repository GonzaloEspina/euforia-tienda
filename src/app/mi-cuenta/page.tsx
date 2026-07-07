"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { fetchWpSession, getWpPuntosApiBase } from "@/lib/wp-session";
import { WpLoginForm } from "@/components/WpLoginForm";
import { UserOrdersList } from "@/components/UserOrdersList";

type Reward = {
  id: number;
  title: string;
  description?: string;
  benefit_label: string;
  points_cost: number;
};

type HistoryEntry = {
  id: number;
  note?: string;
  type: string;
  points: number;
};

type AccountTab = "orders" | "points";

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

function BillingCard({ session }: { session: NonNullable<Awaited<ReturnType<typeof fetchWpSession>>> }) {
  const billing = session.billing;
  if (!billing?.address_1 && !billing?.phone) return null;

  return (
    <div className="glass rounded-2xl p-5 text-sm space-y-1">
      <h3 className="font-semibold text-travel-ink mb-2">Tus datos</h3>
      <p>
        {[billing.first_name, billing.last_name].filter(Boolean).join(" ") || session.name}
      </p>
      {billing.email || session.email ? <p>{billing.email ?? session.email}</p> : null}
      {billing.phone ? <p>Tel: {billing.phone}</p> : null}
      {billing.address_1 ? (
        <p>
          {billing.address_1}
          {billing.city ? `, ${billing.city}` : ""}
          {billing.postcode ? ` (${billing.postcode})` : ""}
        </p>
      ) : null}
    </div>
  );
}

export default function MiCuentaPage() {
  const [session, setSession] = useState<Awaited<ReturnType<typeof fetchWpSession>> | null>(
    null
  );
  const [sessionLoading, setSessionLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AccountTab>("orders");
  const [dniInput, setDniInput] = useState("");
  const [dni, setDni] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const wpApi = getWpPuntosApiBase();

  const loadData = useCallback(
    async (normalizedDni: string) => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const [b, r, h] = await Promise.all([
          fetchJson<{ balance: number }>(`${wpApi}/balance?dni=${normalizedDni}`, {
            credentials: "include",
          }),
          fetchJson<{ rewards: Reward[] }>(`${wpApi}/rewards`, {
            credentials: "include",
          }),
          fetchJson<{ history: HistoryEntry[] }>(
            `${wpApi}/history?dni=${normalizedDni}`,
            { credentials: "include" }
          ),
        ]);
        setDni(normalizedDni);
        setBalance(b.balance);
        setRewards(r.rewards ?? []);
        setHistory(h.history ?? []);
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
            await loadData(data.dni);
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
    await loadData(normalized);
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
      setSuccess(
        result.coupon_code
          ? `Canje exitoso. Tu cupón es: ${result.coupon_code}`
          : result.message ?? "Canje exitoso."
      );
      await loadData(dni);
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

          <BillingCard session={session} />

          <div className="flex gap-2 border-b border-sky-100">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                activeTab === "orders"
                  ? "border-euforia-sky-dark text-euforia-sky-dark"
                  : "border-transparent text-travel-ink-muted hover:text-travel-ink"
              }`}
            >
              Mis pedidos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("points")}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                activeTab === "points"
                  ? "border-euforia-sky-dark text-euforia-sky-dark"
                  : "border-transparent text-travel-ink-muted hover:text-travel-ink"
              }`}
            >
              Mis puntos
            </button>
          </div>

          {activeTab === "orders" ? (
            <UserOrdersList />
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
              session={session}
              redeem={redeem}
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
                await loadData(data.dni);
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
            session={session}
            redeem={redeem}
          />
        </>
      )}

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
  session: Awaited<ReturnType<typeof fetchWpSession>> | null;
  redeem: (rewardId: number) => void;
};

function PointsSection({
  dniInput,
  setDniInput,
  onSubmit,
  loading,
  dni,
  balance,
  rewards,
  history,
  session,
  redeem,
}: PointsSectionProps) {
  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="glass rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-semibold">Mis puntos Euforia</h2>
        <p className="text-sm text-travel-ink-muted">
          Consultá tu saldo con tu DNI. Si estás logueado, lo completamos automáticamente cuando
          esté cargado en tu cuenta.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={dniInput}
            onChange={(e) => setDniInput(e.target.value)}
            placeholder="Ingresá tu DNI"
            className="flex-1 rounded-xl border border-sky-200 px-3 py-2.5"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-euforia-sky-dark text-white font-semibold disabled:opacity-60"
          >
            {loading ? "Consultando..." : "Consultar puntos"}
          </button>
        </div>
      </form>

      {dni && balance !== null && (
        <>
          <div className="rounded-2xl bg-gradient-to-r from-euforia-sky-dark to-euforia-sky p-5 text-white">
            <p className="text-sm/5 opacity-90">DNI {dni}</p>
            <p className="text-4xl font-black">{balance}</p>
            <p className="text-sm/5 opacity-90">puntos disponibles</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => {
              const enabled = session?.logged_in && balance >= reward.points_cost;
              return (
                <article key={reward.id} className="glass rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-euforia-sky-dark">
                    {reward.benefit_label}
                  </p>
                  <h3 className="font-semibold text-lg">{reward.title}</h3>
                  <p className="text-sm text-travel-ink-muted min-h-10">
                    {reward.description || "Canjeá este beneficio con tus puntos."}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-euforia-sky-dark">
                      {reward.points_cost} puntos
                    </span>
                    <button
                      type="button"
                      onClick={() => redeem(reward.id)}
                      disabled={!enabled || loading}
                      className="px-3 py-2 rounded-xl bg-euforia-sky-dark text-white text-sm font-semibold disabled:opacity-50"
                    >
                      Canjear
                    </button>
                  </div>
                  {!session?.logged_in ? (
                    <p className="text-xs text-travel-ink-muted">
                      Ingresá para canjear este premio.
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-3">Historial</h2>
            <ul className="space-y-2">
              {history.length === 0 && (
                <li className="text-sm text-travel-ink-muted">
                  Todavía no hay movimientos.
                </li>
              )}
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{entry.note || entry.type}</span>
                  <span
                    className={
                      entry.points >= 0
                        ? "text-emerald-700 font-semibold"
                        : "text-red-700 font-semibold"
                    }
                  >
                    {entry.points > 0 ? "+" : ""}
                    {entry.points}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
