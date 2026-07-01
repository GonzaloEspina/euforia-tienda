"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartData } from "@/types/salida";
import { apiUrl } from "@/lib/config";

interface CartContextValue {
  cart: CartData | null;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<{ ok: boolean; message?: string }>;
  removeItem: (key: string) => Promise<void>;
  updateQuantity: (key: string, quantity: number) => Promise<void>;
  itemsCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

async function cartFetch(path: string, init?: RequestInit) {
  const res = await fetch(apiUrl(`/api/cart${path}`), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  return res;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await cartFetch("");
      if (res.ok) {
        setCart(await res.json());
      }
    } catch {
      // offline or woo unavailable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productId: number, quantity = 1) => {
      const res = await cartFetch("/add", {
        method: "POST",
        body: JSON.stringify({ id: productId, quantity }),
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data);
        return { ok: true };
      }
      return { ok: false, message: data.message ?? "No se pudo agregar al carrito" };
    },
    []
  );

  const removeItem = useCallback(async (key: string) => {
    const res = await cartFetch("/remove", {
      method: "POST",
      body: JSON.stringify({ key }),
    });
    if (res.ok) setCart(await res.json());
  }, []);

  const updateQuantity = useCallback(async (key: string, quantity: number) => {
    const res = await cartFetch("/update", {
      method: "POST",
      body: JSON.stringify({ key, quantity }),
    });
    if (res.ok) setCart(await res.json());
  }, []);

  const value = useMemo(
    () => ({
      cart,
      loading,
      refresh,
      addItem,
      removeItem,
      updateQuantity,
      itemsCount: cart?.itemsCount ?? 0,
    }),
    [cart, loading, refresh, addItem, removeItem, updateQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
