"use client";

import ConfettiBurst from "@/components/ConfettiBurst";

export default function CheckoutModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <ConfettiBurst />
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl">
          <p className="mb-2 text-3xl">🎉</p>
          <h2 className="mb-2 text-base font-bold text-gray-900">Order placed!</h2>
          <p className="mb-4 text-sm text-gray-600">
            This is a concept prototype — no real order was placed and no payment was taken. Ritual
            is a demo of an evidence-based routine advisor inside a Blinkit-style UI, built for a
            fellowship submission.
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-[#0C831F] py-2.5 text-sm font-bold text-white"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
