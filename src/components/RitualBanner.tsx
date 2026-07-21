import Link from "next/link";
import type { Intent } from "@/lib/queryClassifier";
import { INTENT_LABELS } from "@/lib/queryClassifier";

export default function RitualBanner({ intent, query }: { intent: Intent; query: string }) {
  return (
    <Link
      href={`/consult?intent=${intent}&q=${encodeURIComponent(query)}`}
      className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-green-50 to-white p-3 shadow-sm ring-1 ring-[#0C831F]/20"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#0C831F]">Ritual</p>
        <p className="text-sm font-semibold text-gray-900">
          Build a {INTENT_LABELS[intent]} with evidence-backed picks
        </p>
        <p className="text-xs text-gray-500">3 questions, 60 seconds</p>
      </div>
      <span className="shrink-0 rounded-lg bg-[#0C831F] px-4 py-2 text-xs font-bold text-white">Start</span>
    </Link>
  );
}
