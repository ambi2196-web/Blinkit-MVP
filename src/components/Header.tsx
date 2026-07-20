"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ROTATING_PLACEHOLDERS = ["dry skin routine", "high protein diet", "smell good daily"];

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % ROTATING_PLACEHOLDERS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-20 bg-[#F8CB46] px-4 pb-3 pt-4">
      <div className="flex items-center gap-1">
        <span className="text-lg">📍</span>
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-bold text-gray-900">Delivery in 10 minutes</span>
          <span className="text-[11px] text-gray-700">Connaught Place, New Delhi ▾</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 shadow-sm">
        <span className="text-gray-400">🔍</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search "${ROTATING_PLACEHOLDERS[placeholderIndex]}"`}
          className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />
      </form>
    </header>
  );
}
