"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { ComposedRoutine, EvidenceEntry } from "@/lib/routineEngine";
import EvidenceBottomSheet from "@/components/EvidenceBottomSheet";

export default function RoutineCard({ routine }: { routine: ComposedRoutine }) {
  const { addToCart } = useCart();
  const [openEvidence, setOpenEvidence] = useState<EvidenceEntry | null>(null);
  const [addedAll, setAddedAll] = useState(false);

  const handleAddAll = () => {
    routine.items.forEach((item) => addToCart(item.product.id));
    setAddedAll(true);
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="text-base font-bold text-gray-900">{routine.title}</h2>
        <span className="text-sm font-bold text-[#0C831F]">₹{routine.totalPrice}</span>
      </div>
      <p className="mb-3 text-xs text-gray-500">
        Delivers in 10 min · {routine.reviewedBy}
      </p>

      <div className="flex flex-col gap-3">
        {routine.items.map((item) => (
          <div key={item.product.id} className="border-b border-gray-50 pb-3 last:border-0">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-2xl">
                🧴
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                <p className="text-xs text-gray-500">{item.product.size}</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">₹{item.product.price}</p>
                <p className="mt-1 text-xs text-gray-600">{item.why}</p>

                {item.evidence && (
                  <button
                    onClick={() => setOpenEvidence(item.evidence!)}
                    className="mt-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700"
                  >
                    🔬 {item.evidence.study_count > 0 ? `${item.evidence.study_count} studies` : "evidence"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {routine.skipNote && (
        <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">💡 {routine.skipNote}</p>
      )}

      {addedAll ? (
        <Link
          href="/cart"
          className="mt-4 block w-full rounded-lg bg-[#0C831F] py-3 text-center text-sm font-bold text-white"
        >
          Added — View Cart ▸
        </Link>
      ) : (
        <button
          onClick={handleAddAll}
          className="mt-4 w-full rounded-lg bg-[#0C831F] py-3 text-sm font-bold text-white"
        >
          Add all {routine.items.length} to cart — ₹{routine.totalPrice}
        </button>
      )}

      <p className="mt-4 text-center text-[11px] text-gray-400">
        Ritual recommendations are never sponsored.
      </p>

      {openEvidence && (
        <EvidenceBottomSheet evidence={openEvidence} onClose={() => setOpenEvidence(null)} />
      )}
    </div>
  );
}
