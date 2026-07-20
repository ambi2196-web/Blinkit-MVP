"use client";

import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";

const CATEGORY_EMOJI: Record<string, string> = {
  personal_care: "🧴",
  pharma_wellness: "💊",
  grocery: "🥚",
  grooming: "✂️",
  home_habit: "🏠",
};

export default function ProductCard({ product }: { product: Product }) {
  const { quantities, addToCart, removeFromCart } = useCart();
  const qty = quantities[product.id] ?? 0;
  const discountPct =
    product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <div className="flex w-36 shrink-0 flex-col gap-1.5 rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm">
      <div className="relative flex h-24 w-full items-center justify-center rounded-lg bg-gray-50 text-4xl">
        {CATEGORY_EMOJI[product.category] ?? "📦"}
        {discountPct > 0 && (
          <span className="absolute left-1 top-1 rounded bg-[#0C831F] px-1 py-0.5 text-[10px] font-semibold text-white">
            {discountPct}% OFF
          </span>
        )}
        <span className="absolute bottom-1 right-1 rounded bg-white/90 px-1 py-0.5 text-[9px] font-medium text-gray-500">
          {product.delivery_min} min
        </span>
      </div>

      <p className="line-clamp-2 min-h-[2.2rem] text-xs font-medium text-gray-800">{product.name}</p>
      <p className="text-[11px] text-gray-500">{product.size}</p>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">₹{product.price}</span>
          {discountPct > 0 && (
            <span className="text-[10px] text-gray-400 line-through">₹{product.mrp}</span>
          )}
        </div>

        {qty === 0 ? (
          <button
            onClick={() => addToCart(product.id)}
            className="rounded-md border border-[#0C831F] px-3 py-1 text-xs font-semibold text-[#0C831F] hover:bg-green-50"
          >
            ADD
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-md bg-[#0C831F] px-1.5 py-1 text-white">
            <button onClick={() => removeFromCart(product.id)} className="px-1 text-xs font-bold">
              -
            </button>
            <span className="text-xs font-semibold">{qty}</span>
            <button onClick={() => addToCart(product.id)} className="px-1 text-xs font-bold">
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
