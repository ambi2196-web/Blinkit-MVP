"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getProduct } from "@/lib/catalog";

export default function CartPage() {
  const { quantities, addToCart, removeFromCart, totalItems, totalPrice } = useCart();
  const entries = Object.entries(quantities)
    .map(([id, qty]) => ({ product: getProduct(id), qty }))
    .filter((e) => e.product);

  return (
    <main className="px-4 pt-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-lg">
          ←
        </Link>
        <h1 className="text-base font-bold text-gray-900">My Cart</h1>
      </div>

      {entries.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-2 text-center">
          <span className="text-4xl">🛒</span>
          <p className="text-sm text-gray-500">Your cart is empty.</p>
          <Link href="/" className="mt-2 rounded-md bg-[#0C831F] px-4 py-2 text-sm font-semibold text-white">
            Start shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-sm">
            {entries.map(({ product, qty }) => (
              <div key={product!.id} className="flex items-center gap-3 border-b border-gray-50 py-2 last:border-0">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-2xl">
                  📦
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-800">{product!.name}</p>
                  <p className="text-[11px] text-gray-500">{product!.size}</p>
                  <p className="text-sm font-semibold text-gray-900">₹{product!.price * qty}</p>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-[#0C831F] px-1.5 py-1 text-white">
                  <button onClick={() => removeFromCart(product!.id)} className="px-1 text-xs font-bold">
                    -
                  </button>
                  <span className="text-xs font-semibold">{qty}</span>
                  <button onClick={() => addToCart(product!.id)} className="px-1 text-xs font-bold">
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Item total ({totalItems} items)</span>
              <span className="font-semibold text-gray-900">₹{totalPrice}</span>
            </div>
          </div>

          <button
            className="mt-4 w-full rounded-lg bg-[#0C831F] py-3 text-sm font-bold text-white"
            onClick={() => alert("This is a concept prototype — checkout isn't wired up yet.")}
          >
            Proceed to Checkout — ₹{totalPrice}
          </button>

          <p className="mt-6 pb-6 text-center text-[11px] text-gray-400">
            Ritual recommendations are never sponsored.
          </p>
        </>
      )}
    </main>
  );
}
