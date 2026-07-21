"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ritual-disclaimer-seen";

export default function ConceptDisclaimerModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = window.sessionStorage.getItem(STORAGE_KEY);
    if (!seen) setVisible(true);
  }, []);

  const dismiss = () => {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <p className="mb-2 text-2xl">🧪</p>
        <h2 className="mb-2 text-base font-bold text-gray-900">This is a concept prototype</h2>
        <p className="mb-4 text-sm text-gray-600">
          Ritual is a demo built to showcase a feature idea inside a Blinkit-style UI. It is not
          affiliated with Blinkit, uses no real payments or accounts, and the catalog/prices are
          illustrative. Evidence-based recommendations are for demonstration only — always check
          with a doctor for medical decisions.
        </p>
        <button
          onClick={dismiss}
          className="w-full rounded-lg bg-[#0C831F] py-2.5 text-sm font-bold text-white"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
