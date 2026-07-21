"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProduct } from "@/lib/catalog";

const STORAGE_KEY = "ritual-blinkit-cart";
const ROUTINE_STORAGE_KEY = "ritual-blinkit-cart-routine-ids";

interface CartContextValue {
  quantities: Record<string, number>;
  routineIds: string[];
  addToCart: (id: string, fromRoutine?: boolean) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [routineIds, setRoutineIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setQuantities(JSON.parse(stored));
      const storedRoutine = window.localStorage.getItem(ROUTINE_STORAGE_KEY);
      if (storedRoutine) setRoutineIds(JSON.parse(storedRoutine));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(quantities));
  }, [quantities, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(routineIds));
  }, [routineIds, hydrated]);

  const addToCart = (id: string, fromRoutine = false) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    if (fromRoutine) {
      setRoutineIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
  };

  const removeFromCart = (id: string) =>
    setQuantities((prev) => {
      const next = { ...prev };
      if (next[id] <= 1) delete next[id];
      else next[id] -= 1;
      return next;
    });

  const setQty = (id: string, qty: number) =>
    setQuantities((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });

  const { totalItems, totalPrice } = useMemo(() => {
    let items = 0;
    let price = 0;
    for (const [id, qty] of Object.entries(quantities)) {
      const product = getProduct(id);
      if (!product) continue;
      items += qty;
      price += product.price * qty;
    }
    return { totalItems: items, totalPrice: price };
  }, [quantities]);

  return (
    <CartContext.Provider
      value={{ quantities, routineIds, addToCart, removeFromCart, setQty, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
