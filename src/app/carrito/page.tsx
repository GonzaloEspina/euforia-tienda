"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { CHECKOUT_URL, ACCOUNT_URL } from "@/lib/woocommerce";

const REDIRECT_AFTER_LOGIN = "https://viajaconeuforia.com/tienda/carrito";

function formatCartPrice(minor: string, symbol: string): string {
  const num = Number(minor) / 100;
  return `${symbol}${num.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
}

export default function CarritoPage() {
  const { cart, loading, removeItem, updateQuantity } = useCart();

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-euforia-muted">
        Cargando carrito...
      </div>
    );
  }

  if (!cart?.items.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-2xl font-bold mb-2">Tu carrito está vacío</h1>
        <p className="text-euforia-muted mb-6">
          Explorá el catálogo y agregá las salidas que te interesen.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-euforia-sky text-euforia-darker font-bold"
        >
          Ver salidas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tu carrito</h1>

      <div className="space-y-4 mb-8">
        {cart.items.map((item) => (
          <div
            key={item.key}
            className="glass rounded-2xl p-4 flex gap-4 items-start"
          >
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-euforia-gray">
              {item.images[0] && (
                <Image
                  src={item.images[0].src}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-snug mb-2 line-clamp-2">
                {item.name}
              </h3>
              <p className="text-euforia-sky font-bold">
                {formatCartPrice(
                  item.totals.line_total,
                  cart.totals.currency_symbol
                )}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.key, Math.max(1, item.quantity - 1))
                  }
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-base"
                  aria-label="Menos"
                >
                  −
                </button>
                <span className="w-9 text-center text-base">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.key, item.quantity + 1)}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-base"
                  aria-label="Más"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  className="ml-auto text-sm text-red-400 hover:text-red-300"
                >
                  Quitar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total</span>
          <span className="text-euforia-sky">
            {formatCartPrice(
              cart.totals.total_price,
              cart.totals.currency_symbol
            )}{" "}
            <span className="text-sm font-normal text-euforia-muted">
              ({cart.totals.currency_code})
            </span>
          </span>
        </div>

        <p className="text-sm text-euforia-muted">
          Los precios mostrados en el carrito están en{" "}
          {cart.totals.currency_code === "ARS"
            ? "pesos argentinos"
            : cart.totals.currency_code}
          , según la configuración de WooCommerce.
        </p>

        <a
          href={CHECKOUT_URL}
          className="block w-full py-3.5 rounded-xl bg-euforia-sky hover:bg-euforia-sky-light text-euforia-darker font-bold text-center transition-all"
        >
          Finalizar compra en WooCommerce →
        </a>

        <a
          href={`${ACCOUNT_URL}/?redirect_to=${encodeURIComponent(REDIRECT_AFTER_LOGIN)}`}
          className="block text-center text-base text-euforia-muted hover:text-euforia-sky"
        >
          Iniciar sesión / Mi cuenta
        </a>
      </div>
    </div>
  );
}
