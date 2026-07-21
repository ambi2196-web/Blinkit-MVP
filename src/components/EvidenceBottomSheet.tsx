"use client";

import type { EvidenceEntry } from "@/lib/routineEngine";

const STRENGTH_STYLE: Record<string, string> = {
  strong: "bg-green-100 text-green-800",
  moderate: "bg-amber-100 text-amber-800",
  preference: "bg-gray-100 text-gray-700",
};

export default function EvidenceBottomSheet({
  evidence,
  onClose,
}: {
  evidence: EvidenceEntry;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative z-10 mx-auto w-full max-w-md rounded-t-2xl bg-white p-4 shadow-xl animate-[slideUp_0.2s_ease-out]">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />

        <div className="mb-2 flex items-center justify-between">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
              STRENGTH_STYLE[evidence.strength] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {evidence.strength} evidence
          </span>
          <button onClick={onClose} className="text-sm text-gray-400">
            ✕
          </button>
        </div>

        <p className="mb-1 text-sm font-semibold text-gray-900">{evidence.claim}</p>
        <p className="mb-3 text-sm text-gray-600">{evidence.plain_summary}</p>

        {evidence.sources.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Sources</p>
            {evidence.sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 underline"
              >
                {s.title} — {s.journal} ({s.year})
              </a>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
