"use client";

import { useCallback, useEffect, useState } from "react";
import { ACCOUNT_PAGE_URL } from "@/lib/config";
import {
  fetchWpOrders,
  formatOrderDate,
  formatOrderTotal,
  orderStatusColor,
  type WpOrder,
} from "@/lib/wp-orders";

function OrderCard({ order }: { order: WpOrder }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="glass rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-sky-50/50 transition-colors"
      >
        <div>
          <p className="font-semibold text-travel-ink">Pedido #{order.number}</p>
          <p className="text-sm text-travel-ink-muted">{formatOrderDate(order.date)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${orderStatusColor(order.status)}`}
          >
            {order.status_label}
          </span>
          <span className="font-bold text-euforia-sky-dark">{formatOrderTotal(order)}</span>
          <span className="text-sm text-travel-ink-muted">
            {order.item_count} {order.item_count === 1 ? "ítem" : "ítems"}
          </span>
        </div>
      </button>

      {open ? (
        <div className="border-t border-sky-100 px-4 py-4 space-y-4 bg-white/60">
          <ul className="space-y-2">
            {order.items.map((item, index) => (
              <li key={`${item.name}-${index}`} className="flex items-center gap-3 text-sm">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover bg-sky-50"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-sky-50" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-travel-ink">{item.name}</p>
                  <p className="text-travel-ink-muted">Cantidad: {item.quantity}</p>
                </div>
                <span className="font-semibold">{order.currency_symbol}{item.total}</span>
              </li>
            ))}
          </ul>

          {order.payment_method ? (
            <p className="text-sm text-travel-ink-muted">
              Pago: <span className="text-travel-ink">{order.payment_method}</span>
            </p>
          ) : null}

          {(order.billing.address_1 || order.billing.phone) ? (
            <div className="text-sm text-travel-ink-muted space-y-1">
              <p className="font-medium text-travel-ink">Datos de facturación</p>
              <p>
                {[order.billing.first_name, order.billing.last_name].filter(Boolean).join(" ")}
              </p>
              {order.billing.phone ? <p>Tel: {order.billing.phone}</p> : null}
              {order.billing.address_1 ? (
                <p>
                  {order.billing.address_1}
                  {order.billing.city ? `, ${order.billing.city}` : ""}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function UserOrdersList() {
  const [orders, setOrders] = useState<WpOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async (nextPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWpOrders(nextPage);
      setOrders(data.orders ?? []);
      setPage(data.page);
      setTotalPages(data.total_pages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-travel-ink">Mis pedidos</h2>
          <p className="text-sm text-travel-ink-muted">
            Consultá el estado y el detalle de tus compras.
          </p>
        </div>
        <a
          href={ACCOUNT_PAGE_URL}
          className="text-sm text-euforia-sky-dark hover:underline shrink-0"
        >
          Editar datos en WordPress
        </a>
      </div>

      {loading ? (
        <p className="text-sm text-travel-ink-muted">Cargando pedidos...</p>
      ) : error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 text-sm">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass rounded-2xl p-5 text-sm text-travel-ink-muted">
          Todavía no tenés pedidos registrados en tu cuenta.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="flex justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => load(page - 1)}
                className="px-3 py-2 rounded-xl border border-sky-200 text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-3 py-2 text-sm text-travel-ink-muted">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => load(page + 1)}
                className="px-3 py-2 rounded-xl border border-sky-200 text-sm disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
