"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function BottomCartBar() {
  const { totalItems, totalPrice } = useCart();
  const pathname = usePathname();

  if (totalItems === 0 || pathname === "/cart") return null;

  return (
    <Link
      href="/cart"
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between bg-[#0C831F] px-4 py-3 text-white shadow-[0_-2px_8px_rgba(0,0,0,0.15)]"
    >
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-bold">{totalItems} item{totalItems > 1 ? "s" : ""}</span>
        <span className="text-xs opacity-90">₹{totalPrice}</span>
      </div>
      <span className="text-sm font-bold">View Cart ▸</span>
    </Link>
  );
}
